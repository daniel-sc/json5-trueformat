import { JSON5ArrayElement } from './JSON5ArrayElement';
import type { WhiteSpaceOrComment } from './whiteSpaceOrComment';
import { JSON5Literal } from './JSON5Literal';

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

  *literals(): Generator<JSON5Literal> {
    for (const entry of this.elements) {
      if (entry instanceof JSON5ArrayElement) {
        if (entry.value instanceof JSON5Literal) {
          yield entry.value;
        } else {
          yield* entry.value.literals();
        }
      }
    }
  }
}
