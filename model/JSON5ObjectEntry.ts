import type { JSON5Value } from './JSON5Value';
import type { WhiteSpaceOrComment } from './whiteSpaceOrComment';

/**
 * Represents a single object entry (key/value pair).
 * The key is stored as:
 * - keyQuote: the quote character if quoted (empty string if not quoted)
 * - key: the actual key text (without quotes)
 * - keySuffix: any formatting between the key and the colon.
 */
export class JSON5ObjectEntry {
  /**
   * @param {string} keyQuote - The quote character if quoted (empty string if not quoted).
   * @param {string} key - The actual key text (without quotes).
   * @param {WhiteSpaceOrComment} preColon - Any formatting after the key and before colon.
   * @param {WhiteSpaceOrComment} postColon - Whitespace/comments after the colon.
   * @param {JSON5Value} value - The value node.
   * @param {WhiteSpaceOrComment} post - Whitespace/comments between value and comma.
   * @param {string} comma - Comma, if present.
   */
  constructor(
    public keyQuote: string,
    public key: string,
    public preColon: WhiteSpaceOrComment,
    public postColon: WhiteSpaceOrComment,
    public value: JSON5Value,
    public post: WhiteSpaceOrComment,
    public comma: string,
  ) {}

  /**
   * Convert the object entry to a string.
   * @returns {string} - The string representation of the object entry.
   */
  toString(): string {
    return (
      (this.keyQuote ? this.keyQuote + this.key + this.keyQuote : this.key) +
      this.preColon +
      ':' +
      this.postColon +
      this.value.toString() +
      this.post +
      this.comma
    );
  }
}

