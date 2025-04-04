import { JSON5ObjectEntry } from './JSON5ObjectEntry';
import type { WhiteSpaceOrComment } from './whiteSpaceOrComment';
import type { JSON5Value } from './JSON5Value';

/**
 * Represents a JSON5 object.
 */
export class JSON5Object {
  /**
   * @param {(JSON5ObjectEntry | WhiteSpaceOrComment)[]} entries - The entries of the JSON5 object.
   */
  constructor(public entries: (JSON5ObjectEntry | WhiteSpaceOrComment)[]) {}

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
        index = this.entries.length;
        this.addEntryAtIndex(index, entry);
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
  }

  /**
   * Add a key-value pair to the JSON5 object.
   * This method tries to maintain the original formatting of the object.
   *
   * @param key
   * @param value
   * @param options
   */
  addKeyValue(key: string, value: JSON5Value, options?: { beforeKey?: string; afterKey?: string }): void {
    const siblingObjectEntries = this.entries.filter((e) => e instanceof JSON5ObjectEntry);
    const similarEntry =
      siblingObjectEntries.find((e) => e.value.constructor === value.constructor) ?? siblingObjectEntries.at(0);
    const entry = new JSON5ObjectEntry(
      similarEntry?.keyQuote ?? '"',
      key,
      similarEntry?.preColon ?? '',
      similarEntry?.postColon ?? ' ',
      value,
      similarEntry?.post ?? '',
      '',
    );
    this.addEntry(entry, options);
  }
}
