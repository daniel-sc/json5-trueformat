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

  getValue(key1: string): JSON5Value|undefined {
    for (const entry of this.entries) {
      if (entry instanceof JSON5ObjectEntry && entry.key === key1) {
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
  addEntry(entry: JSON5ObjectEntry, options?: {beforeKey?: string, afterKey?: string}): void {
    let index: number;
    if (options?.beforeKey) {
      index = this.entries.findIndex((e) => e instanceof JSON5ObjectEntry && e.key === options.beforeKey);
      if (index === -1) {
        index = this.entries.length;
      }
      this.entries.splice(index, 0, entry);
    } else {
      index = options?.afterKey ? this.entries.findIndex((e) => e instanceof JSON5ObjectEntry && e.key === options.afterKey) : this.entries.findLastIndex(e => e instanceof JSON5ObjectEntry);
      if (index === -1) {
        index = this.entries.length;
        this.entries.splice(index, 0, entry);
      } else {
        const wsBeforeIndex = typeof this.entries[index -1]  === 'string' ? this.entries[index -1] : undefined;
        const wsAfterIndex = typeof this.entries[index+1] === 'string' ? this.entries[index+1] : undefined;
        if (wsBeforeIndex && wsAfterIndex) {
          this.entries[index+1] = wsBeforeIndex;
          this.entries.splice(index+2, 0, entry, wsAfterIndex);
        } else {
          this.entries.splice(index + 1, 0, entry);
        }
      }
    }
  }
}

