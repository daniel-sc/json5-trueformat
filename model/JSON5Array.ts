import { JSON5ArrayElement } from './JSON5ArrayElement';
import type { WhiteSpaceOrComment } from './whiteSpaceOrComment';

/** Represents a JSON5 array.
 */
export class JSON5Array {
  constructor(public elements: (JSON5ArrayElement | WhiteSpaceOrComment)[]) {}

  toString(): string {
    return '[' + this.elements.map((e) => e.toString()).join('') + ']';
  }
}
