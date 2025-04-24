import type { JSON5Value } from './JSON5Value';
import type { WhiteSpaceOrComment } from './whiteSpaceOrComment';
import { JSON5Object } from './JSON5Object';
import { JSON5Array } from './JSON5Array';

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
  ) {
    if (value instanceof JSON5Object || value instanceof JSON5Array) {
      value.parent = this;
    }
  }

  /**
   * Convert the document to a string.
   * @returns {string} - The string representation of the document.
   */
  toString(): string {
    return this.pre + this.value.toString() + this.post;
  }
}
