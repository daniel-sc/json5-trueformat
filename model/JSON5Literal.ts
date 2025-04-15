/**
 * Represents a literal value (number, boolean, null, or a string literal).
 */
export class JSON5Literal {
  constructor(
    public raw: string,
    public quote: '"' | "'" | '',
  ) {}

  /**
   * Convert the JSON5 literal to its primitive value.
   * Escape sequences are replaced with their corresponding characters.
   */
  toPrimitive(): string | number | boolean | null {
    if (this.quote === '') {
      if (this.raw === 'null') {
        return null;
      } else if (this.raw === 'true') {
        return true;
      } else if (this.raw === 'false') {
        return false;
      } else if (!isNaN(Number(this.raw))) {
        return Number(this.raw);
      }
    }
    return this.raw.replace(/\\(["'nrbft\\])/g, (_match, char: string) => {
      switch (char) {
        case 'n':
          return '\n';
        case 'r':
          return '\r';
        case 'b':
          return '\b';
        case 'f':
          return '\f';
        case 't':
          return '\t';
        default:
          return char;
      }
    });
  }

  toString(): string {
    return this.quote + this.raw + this.quote;
  }

  static fromPrimitive(value: string | number | boolean | null, quote: '"' | "'" | '' = '"'): JSON5Literal {
    if (value === null) {
      return new JSON5Literal('null', '');
    } else if (typeof value === 'number') {
      return new JSON5Literal(value.toString(), '');
    } else if (typeof value === 'boolean') {
      return new JSON5Literal(value.toString(), '');
    } else {
      // noinspection SuspiciousTypeOfGuard
      if (typeof value === 'string') {
        const escaped = value
          .replace(/\\/g, '\\\\')
          .replace(/\r/g, '\\r')
          .replace(/\n/g, '\\n')
          .replace(/\t/g, '\\t')
          .replaceAll('\b', '\\b')
          .replaceAll('\f', '\\f');
        return new JSON5Literal(quote ? escaped.replace(new RegExp(quote, 'g'), `\\${quote}`) : escaped, quote);
      }
    }
    throw new Error('Invalid primitive type');
  }
}
