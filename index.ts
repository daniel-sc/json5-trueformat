/***********************************************************************
 * JSON5 TrueFormat (Simplified)
 *
 * A TypeScript library for parsing, editing, and serializing JSON5 files
 * while preserving all formatting details (whitespace, comments, etc.).
 *
 * Changes from the earlier version:
 * - Uses plain classes and type unions instead of a shared interface.
 * - In JSON5ObjectEntry the key’s quotes are stored separately.
 * - Static literal tokens (like "{" or "[") are not stored in dedicated fields.
 *
 * Tests below use Bun’s test runner (imported from "bun:test").
 ***********************************************************************/

import { JSON5Parser } from './JSON5Parser';

/** Type union for JSON5 values (object, array, or literal) */
export type JSON5Value = JSON5Object | JSON5Array | JSON5Literal;
export type WhiteSpaceOrComment = string;

/** Represents the entire JSON5 document. */
export class JSON5Document {
  constructor(
    public pre: WhiteSpaceOrComment,
    public value: JSON5Value,
    public post: WhiteSpaceOrComment,
  ) {}
  toString(): string {
    return this.pre + this.value.toString() + this.post;
  }
}

/**
 * Represents a JSON5 object.
 */
export class JSON5Object {
  constructor(public entries: (JSON5ObjectEntry | WhiteSpaceOrComment)[]) {}
  toString(): string {
    return '{' + this.entries.map((e) => e.toString()).join('') + '}';
  }
}

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

/** Represents a JSON5 array.
 */
export class JSON5Array {
  constructor(public elements: (JSON5ArrayElement | WhiteSpaceOrComment)[]) {}
  toString(): string {
    return '[' + this.elements.map((e) => e.toString()).join('') + ']';
  }
}

/** Represents a single array element. */
export class JSON5ArrayElement {
  constructor(
    public value: JSON5Value, // the element value node
    public post: string, // whitespace/comments between value and comma
    public comma: string, // comma, if present
  ) {}
  toString(): string {
    return this.value.toString() + this.post + this.comma;
  }
}

/** Represents a literal value (number, boolean, null, or a string literal).
 *
 */
export class JSON5Literal {
  constructor(
    public raw: string,
    public quote: '"' | "'" | '',
  ) {}
  toString(): string {
    return this.quote + this.raw + this.quote;
  }
}

/***********************************************************************
 * Exported function to parse a JSON5 string.
 ***********************************************************************/
export function parseJSON5(text: string): JSON5Document {
  const parser = new JSON5Parser(text);
  return parser.parseDocument();
}
