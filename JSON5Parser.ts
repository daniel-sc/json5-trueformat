import {
  JSON5Array,
  JSON5ArrayElement,
  JSON5Document,
  JSON5Literal,
  JSON5Object,
  JSON5ObjectEntry,
  type JSON5Value,
  type WhiteSpaceOrComment,
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
    if (this.eof())
      throw new Error('Unexpected end of input when expecting a value');
    const ch = this.text[this.pos];
    if (ch === '{') {
      return this.parseObject();
    } else if (ch === '[') {
      return this.parseArray();
    } else if (ch === '"' || ch === "'") {
      // For literal string values, we preserve the quotes in "raw".
      return this.parseStringLiteral();
    } else {
      return this.parseNonStringLiteral();
    }
  }

  /***********************
   * Object parsing
   ***********************/
  parseObject(): JSON5Object {
    // Consume the opening '{'
    if (this.text[this.pos] !== '{') throw new Error("Expected '{' for object");
    this.pos++;
    const entries: (JSON5ObjectEntry | WhiteSpaceOrComment)[] = [];

    while (this.text[this.pos] !== '}') {
      const entryPre = this.parseWS();
      if (entryPre) {
        entries.push(entryPre);
        continue;
      }

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
      const preColon = this.parseWS();
      if (this.text[this.pos] !== ':')
        throw new Error("Expected ':' in object entry");
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
        keyQuote,
        key,
        preColon,
        postColon,
        value,
        post,
        comma,
      );
      entries.push(entry);
    }
    if (this.text[this.pos] !== '}')
      throw new Error("Expected '}' at end of object");
    this.pos++;
    return new JSON5Object(entries);
  }

  /** Helper to parse the content of a quoted key.
   *  Reads until an unescaped closing quote is encountered.
   */
  parseStringContent(quote: string): string {
    const start = this.pos;
    while (!this.eof()) {
      const ch = this.text[this.pos];
      if (ch === '\\') {
        this.pos += 2; // skip escape (simplistic) TOOD?
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
  parseArray(): JSON5Array {
    if (this.text[this.pos] !== '[') throw new Error("Expected '[' for array");
    this.pos++;
    const elements: (JSON5ArrayElement | WhiteSpaceOrComment)[] = [];

    while (this.text[this.pos] !== ']') {
      const elemPre = this.parseWS();
      if (elemPre) {
        elements.push(elemPre);
        continue;
      }
      const value = this.parseValue();
      const post = this.parseWS();
      let comma: ',' | '' = '';
      if (!this.eof() && this.text[this.pos] === ',') {
        comma = this.text[this.pos] as ',';
        this.pos++;
      } else {
        this.pos -= post.length;
      }
      const element = new JSON5ArrayElement(value, post, comma);
      elements.push(element);
    }
    if (this.text[this.pos] !== ']')
      throw new Error("Expected ']' at end of array");
    this.pos++;
    return new JSON5Array(elements);
  }

  /***********************
   * String literal parsing (for values)
   ***********************/
  parseStringLiteral(): JSON5Literal {
    const raw = this.parseStringRaw();
    const hasQuotes = raw[0] === '"' || raw[0] === "'";
    const quotes = hasQuotes ? (raw[0] as '"' | "'") : '';
    return new JSON5Literal(
      quotes ? raw.substring(1, raw.length - 1) : raw,
      quotes,
    );
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
  parseNonStringLiteral(): JSON5Literal {
    const start = this.pos;
    while (!this.eof() && /[^\s,\]}\[]/.test(this.text[this.pos]!)) {
      this.pos++;
    }
    const raw = this.text.substring(start, this.pos);
    return new JSON5Literal(raw, '');
  }
}
