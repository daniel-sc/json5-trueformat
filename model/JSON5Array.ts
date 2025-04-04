import { JSON5ArrayElement } from './JSON5ArrayElement';
import type { WhiteSpaceOrComment } from './whiteSpaceOrComment';

/**
 * Represents a JSON5 array.
 */
export class JSON5Array {
  /**
   * @param {(JSON5ArrayElement | WhiteSpaceOrComment)[]} elements - The elements of the JSON5 array.
   */
  constructor(public elements: (JSON5ArrayElement | WhiteSpaceOrComment)[]) {}

  /**
   * Convert the array to a string.
   * @returns {string} - The string representation of the array.
   */
  toString(): string {
    return '[' + this.elements.map((e) => e.toString()).join('') + ']';
  }
}
