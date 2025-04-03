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
