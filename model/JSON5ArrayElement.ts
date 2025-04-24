import type { JSON5Value } from './JSON5Value';
import { JSON5Array } from './JSON5Array';
import { JSON5Object } from './JSON5Object';

/**
 * Represents a single array element.
 */
export class JSON5ArrayElement {
  public parent?: JSON5Array;

  /**
   * @param {JSON5Value} value - The element value node.
   * @param {string} post - Whitespace/comments between value and comma.
   * @param {string} comma - Comma, if present.
   */
  constructor(
    public value: JSON5Value,
    public post: string, // whitespace/comments between value and comma
    public comma: string, // comma, if present
  ) {
    if (value instanceof JSON5Object || value instanceof JSON5Array) {
      value.parent = this;
    }
  }

  /**
   * Convert the array element to a string.
   * @returns {string} - The string representation of the array element.
   */
  toString(): string {
    return this.value.toString() + this.post + this.comma;
  }
}
