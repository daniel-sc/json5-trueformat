import { JSON5ObjectEntry } from './JSON5ObjectEntry';
import type { WhiteSpaceOrComment } from './whiteSpaceOrComment';
import type { JSON5Value } from './JSON5Value';
import { JSON5Literal } from './JSON5Literal';
import { JSON5Document } from './JSON5Document';
import { JSON5Array } from './JSON5Array';
import { JSON5ArrayElement } from './JSON5ArrayElement';

function coerce(value: JSON5Value | string | number | null, getQuote: () => '"' | "'" | ''): JSON5Value {
  return typeof value === 'object' && value !== null ? value : JSON5Literal.fromPrimitive(value, getQuote());
}

/**
 * Represents a JSON5 object.
 */
export class JSON5Object {
  public parent?: JSON5ObjectEntry | JSON5ArrayElement | JSON5Document;

  /**
   * @param {(JSON5ObjectEntry | WhiteSpaceOrComment)[]} entries - The entries of the JSON5 object.
   */
  constructor(public entries: (JSON5ObjectEntry | WhiteSpaceOrComment)[]) {
    // Set/update parent for each object entry and its composite value
    this.entries.forEach((e) => {
      if (e instanceof JSON5ObjectEntry) {
        e.parent = this;
      }
    });
  }

  getObjectEntries(): JSON5ObjectEntry[] {
    return this.entries.filter((e) => e instanceof JSON5ObjectEntry);
  }

  /**
   * Convert the object to a string.
   * @returns {string} - The string representation of the object.
   */
  toString(): string {
    return '{' + this.entries.map((e) => e.toString()).join('') + '}';
  }

  getValue(key: string): JSON5Value | undefined {
    for (const entry of this.entries) {
      if (entry instanceof JSON5ObjectEntry && entry.key === key) {
        return entry.value;
      }
    }
    return undefined;
  }

  /**
   * Get all literals in the JSON5 object.
   * @returns {Generator<JSON5Literal>} - A generator that yields JSON5 literals.
   */
  *literals(): Generator<JSON5Literal> {
    for (const entry of this.entries) {
      if (entry instanceof JSON5ObjectEntry) {
        if (entry.value instanceof JSON5Literal) {
          yield entry.value;
        } else {
          yield* entry.value.literals();
        }
      }
    }
  }

  /**
   * Set a value in the JSON5 object. Creates a new entry if the key does not exist.
   * This method tries to maintain the original formatting of the object.
   *
   * @param key
   * @param value
   */
  setValue(key: string, value: JSON5Value | string | number | null): void {
    const coercedValue = coerce(value, () => this.literals().find(() => true)?.quote ?? '"');
    const entry = this.entries.find((e): e is JSON5ObjectEntry => e instanceof JSON5ObjectEntry && e.key === key);
    if (entry) {
      entry.value = coercedValue;
      if (coercedValue instanceof JSON5Object || coercedValue instanceof JSON5Array) {
        coercedValue.parent = entry;
      }
    } else {
      this.addKeyValue(key, coercedValue);
    }
  }

  /**
   * Add an entry to the JSON5 object.
   * This method tries to maintain the original formatting of the object.
   * @param entry
   * @param options
   */
  addEntry(entry: JSON5ObjectEntry, options?: { beforeKey?: string; afterKey?: string }): void {
    let index: number;
    if (options?.beforeKey) {
      index = this.entries.findIndex((e) => e instanceof JSON5ObjectEntry && e.key === options.beforeKey);
      if (index === -1) {
        index = this.entries.length;
        this.addEntryAtIndex(index, entry);
      } else {
        const wsBeforeIndex =
          typeof this.entries[index - 1] === 'string' ? (this.entries[index - 1] as WhiteSpaceOrComment) : undefined;
        const wsAfterIndex = typeof this.entries[index + 1] === 'string' ? this.entries[index + 1] : undefined;
        if (wsBeforeIndex && wsAfterIndex) {
          this.addEntryAtIndex(index, entry, wsBeforeIndex);
        } else {
          this.addEntryAtIndex(index, entry);
        }
      }
    } else {
      index = options?.afterKey
        ? this.entries.findIndex((e) => e instanceof JSON5ObjectEntry && e.key === options.afterKey)
        : this.entries.findLastIndex((e) => e instanceof JSON5ObjectEntry);
      if (index === -1) {
        const indent = this.guessIndentation();
        index = this.entries.length;
        if (indent) {
          const linebreak = this.guessLineBreak() ?? '\n';
          this.entries.splice(index, 0, linebreak + indent);
          this.addEntryAtIndex(index + 1, entry, linebreak + this.getParentObjectOrArray()?.guessIndentation());
        } else {
          this.addEntryAtIndex(index, entry);
        }
      } else {
        const wsBeforeIndex =
          typeof this.entries[index - 1] === 'string' ? (this.entries[index - 1] as WhiteSpaceOrComment) : undefined;
        const wsAfterIndex =
          typeof this.entries[index + 1] === 'string' ? (this.entries[index + 1] as WhiteSpaceOrComment) : undefined;
        if (wsBeforeIndex && wsAfterIndex) {
          this.entries[index + 1] = wsBeforeIndex;
          this.addEntryAtIndex(index + 2, entry, wsAfterIndex);
        } else {
          this.addEntryAtIndex(index + 1, entry);
        }
      }
    }
  }

  private addEntryAtIndex(index: number, entry: JSON5ObjectEntry, wsAfter?: WhiteSpaceOrComment): void {
    if (wsAfter) {
      this.entries.splice(index, 0, entry, wsAfter);
    } else {
      this.entries.splice(index, 0, entry);
    }
    const previousEntry = this.entries.findLast(
      (v, i): v is JSON5ObjectEntry => i < index && v instanceof JSON5ObjectEntry,
    );
    if (previousEntry) {
      previousEntry.comma = ',';
    }
    const isLastEntry = !this.entries.findLast(
      (v, i): v is JSON5ObjectEntry => i > index && v instanceof JSON5ObjectEntry,
    );
    if (!isLastEntry) {
      entry.comma = entry.comma || ',';
    }
    entry.parent = this;
  }

  getParentObjectOrArray(): JSON5Object | JSON5Array | undefined {
    if (this.parent instanceof JSON5ObjectEntry) {
      return this.parent?.parent;
    } else if (this.parent instanceof JSON5ArrayElement) {
      return this.parent?.parent;
    }
    return undefined;
  }

  getParentObject(): JSON5Object | undefined {
    if (this.parent instanceof JSON5ObjectEntry) {
      return this.parent?.parent;
    } else if (this.parent instanceof JSON5ArrayElement) {
      return this.parent?.parent?.getParentObject();
    }
    return undefined;
  }

  guessLineBreak(): string | undefined {
    const withLinebreak = this.entries.filter((e) => typeof e === 'string').find((e) => e.match(/[\n\r]+/));
    if (withLinebreak) {
      const m = withLinebreak.match(/[\n\r]+/);
      if (m) {
        return m[0]!;
      }
    }
    return this.getParentObjectOrArray()?.guessLineBreak();
  }

  /** guesses indentation of its entries */
  guessIndentation(): string | undefined {
    const first = this.entries[0];
    if (typeof first === 'string') {
      const m = first.match(/(?:\n|\r|\r\n|\n\r)+([\t ]+)/);
      if (m) {
        return m[1]!;
      }
    }
    // compute from parents:
    const parentObjectOrArray = this.getParentObjectOrArray();
    const grandparentObjectOrArray = parentObjectOrArray?.getParentObjectOrArray();
    if (parentObjectOrArray) {
      const parentIndent = parentObjectOrArray.guessIndentation();
      const grandparentIndent = grandparentObjectOrArray?.guessIndentation() ?? '';

      return parentIndent !== undefined ? parentIndent + parentIndent.substring(grandparentIndent.length) : '';
    }
  }

  /**
   * Add a key-value pair to the JSON5 object.
   * This method tries to maintain the original formatting of the object.
   *
   * @param key
   * @param value
   * @param options
   */
  addKeyValue(
    key: string,
    value: JSON5Value | string | number | null,
    options?: { beforeKey?: string; afterKey?: string },
  ): void {
    const coercedValue = coerce(value, () => this.literals().find(() => true)?.quote ?? '"');
    const siblingObjectEntries = this.getObjectEntries();
    const similarEntry =
      siblingObjectEntries.find((e) => e.value.constructor === coercedValue.constructor) ??
      siblingObjectEntries.at(0) ??
      this.getParentObject()
        ?.getObjectEntries()
        .find((e) => e.value.constructor === coercedValue.constructor) ??
      this.getParentObject()?.getObjectEntries().at(0);
    const entry = new JSON5ObjectEntry(
      similarEntry?.keyQuote ?? '"',
      key,
      similarEntry?.preColon ?? '',
      similarEntry?.postColon ?? ' ',
      coercedValue,
      similarEntry?.post ?? '',
      '',
    );
    if (coercedValue instanceof JSON5Object || coercedValue instanceof JSON5Array) {
      coercedValue.parent = entry;
    }
    this.addEntry(entry, options);
  }
}
