import type { JSON5Value } from './JSON5Value';

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
