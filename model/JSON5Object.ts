import { JSON5ObjectEntry } from './JSON5ObjectEntry';
import type { WhiteSpaceOrComment } from './whiteSpaceOrComment';

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
}

