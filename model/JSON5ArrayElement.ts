import type { JSON5Value } from './JSON5Value';

/**
 * Represents a single array element.
 */
export class JSON5ArrayElement {
  /**
   * @param {JSON5Value} value - The element value node.
   * @param {string} post - Whitespace/comments between value and comma.
   * @param {string} comma - Comma, if present.
   */
  constructor(
    public value: JSON5Value,
    public post: string, // whitespace/comments between value and comma
    public comma: string, // comma, if present
  ) {}

  /**
   * Convert the array element to a string.
   * @returns {string} - The string representation of the array element.
   */
  toString(): string {
    return this.value.toString() + this.post + this.comma;
  }
}
