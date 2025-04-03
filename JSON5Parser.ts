import {
  JSON5Array,
  JSON5ArrayElement,
  JSON5Document,
  JSON5Literal,
  JSON5Object,
  JSON5ObjectEntry,
  type JSON5Value,
} from './index';

/***********************************************************************
 * JSON5Parser: a recursive-descent parser that preserves formatting.
 ***********************************************************************/
export class JSON5Parser {
  pos: number = 0;
  length: number;

  constructor(public text: string) {
    this.length = text.length;
  }

  eof(): boolean {
    return this.pos >= this.length;
  }

  peek(): string | undefined {
    return this.text[this.pos];
  }

  /** Parse the entire document */
  parseDocument(): JSON5Document {
    const pre = this.parseWS();
    const value = this.parseValue();
    const post = this.parseWS();
    return new JSON5Document(pre, value, post);
  }

  /** Parse whitespace and comments (both // and /* ... * /), returning the exact text. */
  parseWS(): string {
    const start = this.pos;
    while (!this.eof()) {
      const ch = this.text[this.pos];
      if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
        this.pos++;
      } else if (ch === '/') {
        if (this.pos + 1 < this.length) {
          const next = this.text[this.pos + 1];
          if (next === '/' || next === '*') {
            this.parseComment();
          } else {
            break;
          }
        } else {
          break;
        }
      } else {
        break;
      }
    }
    return this.text.substring(start, this.pos);
  }

  /** Parse a comment (either // or /* ... * /). */
  parseComment(): void {
    if (this.text[this.pos] === '/' && this.text[this.pos + 1] === '/') {
      this.pos += 2;
      while (
        !this.eof() &&
        this.text[this.pos] !== '\n' &&
        this.text[this.pos] !== '\r'
      ) {
        this.pos++;
      }
    } else if (this.text[this.pos] === '/' && this.text[this.pos + 1] === '*') {
      this.pos += 2;
      while (
        !this.eof() &&
        !(
          this.text[this.pos] === '*' &&
          this.pos + 1 < this.length &&
          this.text[this.pos + 1] === '/'
        )
      ) {
        this.pos++;
      }
      if (!this.eof()) {
        this.pos += 2;
      }
    }
  }

  /** Parse a JSON5 value: object, array, or literal. */
  parseValue(): JSON5Value {
    const pre = this.parseWS();
    if (this.eof())
      throw new Error('Unexpected end of input when expecting a value');
    const ch = this.text[this.pos];
    if (ch === '{') {
      return this.parseObject(pre);
    } else if (ch === '[') {
      return this.parseArray(pre);
    } else if (ch === '"' || ch === "'") {
      // For literal string values, we preserve the quotes in "raw".
      return this.parseStringLiteral(pre);
    } else {
      return this.parseNonStringLiteral(pre);
    }
  }

  /***********************
   * Object parsing
   ***********************/
  parseObject(pre: string): JSON5Object {
    // Consume the opening '{'
    if (this.text[this.pos] !== '{') throw new Error("Expected '{' for object");
    const open = this.text[this.pos];
    this.pos++;
    const afterOpen = this.parseWS();
    const objectPre = pre + open + afterOpen;
    const entries: JSON5ObjectEntry[] = [];

    // Empty object?
    if (!this.eof() && this.text[this.pos] === '}') {
      const closing = this.text[this.pos];
      this.pos++;
      const post = this.parseWS();
      return new JSON5Object(objectPre, entries, closing + post);
    }

    while (true) {
      const entryPre = this.parseWS();
      // Parse key: either quoted or unquoted.
      let keyQuote = '';
      let key = '';
      if (this.text[this.pos] === '"' || this.text[this.pos] === "'") {
        keyQuote = this.text[this.pos]!;
        this.pos++;
        key = this.parseStringContent(keyQuote);
        if (this.text[this.pos] !== keyQuote) {
          throw new Error('Expected closing quote for key');
        }
        this.pos++; // consume closing quote
      } else {
        // Unquoted key: read until whitespace or colon.
        const startKey = this.pos;
        while (!this.eof() && /[^\s:]/.test(this.text[this.pos]!)) {
          // Allow alphanumerics, _ and $.
          if (!/[a-zA-Z0-9_$]/.test(this.text[this.pos]!)) break;
          this.pos++;
        }
        key = this.text.substring(startKey, this.pos);
      }
      // Capture any formatting between the key and the colon.
      const suffixStart = this.pos;
      while (!this.eof() && this.text[this.pos] !== ':') {
        const ch = this.text[this.pos];
        if (ch === ' ' || ch === '\t') {
          this.pos++;
        } else {
          break;
        }
      }
      const keySuffix = this.text.substring(suffixStart, this.pos);
      const preColon = this.parseWS();
      if (this.text[this.pos] !== ':')
        throw new Error("Expected ':' in object entry");
      const colon = this.text[this.pos]!;
      this.pos++;
      const postColon = this.parseWS();
      const value = this.parseValue();
      const post = this.parseWS();
      let comma = '';
      if (!this.eof() && this.text[this.pos] === ',') {
        comma = this.text[this.pos]!;
        this.pos++;
      }
      const entry = new JSON5ObjectEntry(
        entryPre,
        keyQuote,
        key,
        keySuffix,
        preColon,
        colon,
        postColon,
        value,
        post,
        comma,
      );
      entries.push(entry);
      // Look ahead: if next non-whitespace is "}", break.
      const lookahead = this.parseWS();
      if (!this.eof() && this.text[this.pos] === '}') {
        //this.pos -= lookahead.length; // rewind to the start of the '}'
        break;
      }
    }
    const between = this.parseWS();
    if (this.text[this.pos] !== '}')
      throw new Error("Expected '}' at end of object");
    const closing = this.text[this.pos];
    this.pos++;
    const post = this.parseWS();
    const objectPost = between + closing + post;
    return new JSON5Object(objectPre, entries, objectPost);
  }

  /** Helper to parse the content of a quoted key.
   *  Reads until an unescaped closing quote is encountered.
   */
  parseStringContent(quote: string): string {
    const start = this.pos;
    while (!this.eof()) {
      const ch = this.text[this.pos];
      if (ch === '\\') {
        this.pos += 2; // skip escape (simplistic)
      } else if (ch === quote) {
        break;
      } else {
        this.pos++;
      }
    }
    return this.text.substring(start, this.pos);
  }

  /***********************
   * Array parsing
   ***********************/
  parseArray(pre: string): JSON5Array {
    if (this.text[this.pos] !== '[') throw new Error("Expected '[' for array");
    const open = this.text[this.pos];
    this.pos++;
    const afterOpen = this.parseWS();
    const arrayPre = pre + open + afterOpen;
    const elements: JSON5ArrayElement[] = [];

    // Empty array?
    if (!this.eof() && this.text[this.pos] === ']') {
      const closing = this.text[this.pos];
      this.pos++;
      const post = this.parseWS();
      return new JSON5Array(arrayPre, elements, closing + post);
    }

    while (true) {
      const elemPre = this.parseWS();
      const value = this.parseValue();
      const post = this.parseWS();
      let comma = '';
      if (!this.eof() && this.text[this.pos] === ',') {
        comma = this.text[this.pos]!;
        this.pos++;
      }
      const element = new JSON5ArrayElement(elemPre, value, post, comma);
      elements.push(element);
      const lookahead = this.parseWS();
      if (!this.eof() && this.text[this.pos] === ']') {
        this.pos -= lookahead.length; // rewind to the start of the ']'
        break;
      }
    }
    const between = this.parseWS();
    if (this.text[this.pos] !== ']')
      throw new Error("Expected ']' at end of array");
    const closing = this.text[this.pos];
    this.pos++;
    const post = this.parseWS();
    const arrayPost = between + closing + post;
    return new JSON5Array(arrayPre, elements, arrayPost);
  }

  /***********************
   * String literal parsing (for values)
   ***********************/
  parseStringLiteral(pre: string): JSON5Literal {
    const raw = this.parseStringRaw();
    const post = this.parseWS();
    return new JSON5Literal(pre, raw, post);
  }

  /** Parse a string literal (returns raw text including quotes). */
  parseStringRaw(): string {
    const quote = this.text[this.pos];
    if (quote !== '"' && quote !== "'")
      throw new Error('Expected string literal');
    const start = this.pos;
    this.pos++; // skip opening quote
    while (!this.eof()) {
      const ch = this.text[this.pos];
      if (ch === '\\') {
        this.pos += 2; // skip escaped character (simplified)
      } else if (ch === quote) {
        this.pos++;
        break;
      } else {
        this.pos++;
      }
    }
    return this.text.substring(start, this.pos);
  }

  /***********************
   * Non-string literal parsing
   ***********************/
  parseNonStringLiteral(pre: string): JSON5Literal {
    const start = this.pos;
    while (!this.eof() && /[^\s,\]\}\[]/.test(this.text[this.pos]!)) {
      this.pos++;
    }
    const raw = this.text.substring(start, this.pos);
    const post = this.parseWS();
    return new JSON5Literal(pre, raw, post);
  }
}
