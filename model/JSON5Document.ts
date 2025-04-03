import type { JSON5Value } from './JSON5Value';
import type { WhiteSpaceOrComment } from './whiteSpaceOrComment';

/**
 * Represents the entire JSON5 document.
 */
export class JSON5Document {
  /**
   * @param {WhiteSpaceOrComment} pre - Whitespace or comments before the value.
   * @param {JSON5Value} value - The main JSON5 value.
   * @param {WhiteSpaceOrComment} post - Whitespace or comments after the value.
   */
  constructor(
    public pre: WhiteSpaceOrComment,
    public value: JSON5Value,
    public post: WhiteSpaceOrComment,
  ) {}

  /**
   * Convert the document to a string.
   * @returns {string} - The string representation of the document.
   */
  toString(): string {
    return this.pre + this.value.toString() + this.post;
  }
}

