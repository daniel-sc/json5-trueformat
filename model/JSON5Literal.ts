/**
 * Represents a literal value (number, boolean, null, or a string literal).
 */
export class JSON5Literal {
  constructor(
    public raw: string,
    public quote: '"' | "'" | '',
  ) {}

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
