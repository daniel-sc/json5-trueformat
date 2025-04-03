import { JSON5ObjectEntry } from './JSON5ObjectEntry';
import type { WhiteSpaceOrComment } from './whiteSpaceOrComment';

/**
 * Represents a JSON5 object.
 */
export class JSON5Object {
  constructor(public entries: (JSON5ObjectEntry | WhiteSpaceOrComment)[]) {}

  toString(): string {
    return '{' + this.entries.map((e) => e.toString()).join('') + '}';
  }
}
