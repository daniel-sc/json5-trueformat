import type { JSON5Value } from './JSON5Value';
import type { WhiteSpaceOrComment } from './whiteSpaceOrComment';

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
