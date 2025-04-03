import type { JSON5Value } from './JSON5Value';
import type { WhiteSpaceOrComment } from './whiteSpaceOrComment';

/** Represents a single object entry (key/value pair).
 *  The key is stored as:
 *    - keyQuote: the quote character if quoted (empty string if not quoted)
 *    - key: the actual key text (without quotes)
 *    - keySuffix: any formatting between the key and the colon.
 */
export class JSON5ObjectEntry {
  constructor(
    public keyQuote: string, // either a double-quote or single-quote, or ""
    public key: string, // the key content (unquoted)
    public preColon: WhiteSpaceOrComment, // any formatting after the key and before colon
    public postColon: WhiteSpaceOrComment, // whitespace/comments after the colon
    public value: JSON5Value, // the value node
    public post: WhiteSpaceOrComment, // whitespace/comments between value and comma
    public comma: string, // comma, if present
  ) {}

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
