import { JSON5ArrayElement } from './JSON5ArrayElement';
import type { WhiteSpaceOrComment } from './whiteSpaceOrComment';
import { JSON5Literal } from './JSON5Literal';
import type { JSON5Document } from './JSON5Document';
import { JSON5ObjectEntry } from './JSON5ObjectEntry';
import type { JSON5Object } from './JSON5Object';

/**
 * Represents a JSON5 array.
 */
export class JSON5Array {
  public parent?: JSON5ObjectEntry | JSON5ArrayElement | JSON5Document;

  /**
   * @param {(JSON5ArrayElement | WhiteSpaceOrComment)[]} elements - The elements of the JSON5 array.
   */
  constructor(public elements: (JSON5ArrayElement | WhiteSpaceOrComment)[]) {
    // Set/update parent for each array element and its composite value if applicable
    this.elements.forEach((el) => {
      if (el instanceof JSON5ArrayElement) {
        el.parent = this;
      }
    });
  }

  getParentObjectOrArray(): JSON5Object | JSON5Array | undefined {
    if (this.parent instanceof JSON5ObjectEntry) {
      return this.parent?.parent;
    } else if (this.parent instanceof JSON5ArrayElement) {
      return this.parent?.parent;
    }
    return undefined;
  }

  /** returns next parent that is a JSON5Object */
  getParentObject(): JSON5Object | undefined {
    if (this.parent instanceof JSON5ObjectEntry) {
      return this.parent?.parent;
    } else if (this.parent instanceof JSON5ArrayElement) {
      return this.parent?.parent?.getParentObject();
    }
    return undefined;
  }

  guessIndentation(): string | undefined {
    const first = this.elements[0];
    if (typeof first === 'string') {
      const m = first.match(/(?:\n|\r|\r\n|\n\r)+([\t ]+)/);
      if (m) {
        return m[1]!;
      }
    }
    // compute from parents:
    const parentObjectOrArray = this.getParentObjectOrArray();
    const grandparentObjectOrArray = parentObjectOrArray?.getParentObjectOrArray();
    if (parentObjectOrArray) {
      const parentIndent = parentObjectOrArray.guessIndentation();
      const grandparentIndent = grandparentObjectOrArray?.guessIndentation() ?? '';

      return parentIndent !== undefined ? parentIndent + parentIndent.substring(grandparentIndent.length) : '';
    }
  }

  guessLineBreak(): string | undefined {
    const withLinebreak = this.elements.filter((e) => typeof e === 'string').find((e) => e.match(/[\n\r]+/));
    if (withLinebreak) {
      const m = withLinebreak.match(/[\n\r]+/);
      if (m) {
        return m[0]!;
      }
    }
    return this.getParentObjectOrArray()?.guessLineBreak();
  }

  /**
   * Convert the array to a string.
   * @returns {string} - The string representation of the array.
   */
  toString(): string {
    return '[' + this.elements.map((e) => e.toString()).join('') + ']';
  }

  *literals(): Generator<JSON5Literal> {
    for (const entry of this.elements) {
      if (entry instanceof JSON5ArrayElement) {
        if (entry.value instanceof JSON5Literal) {
          yield entry.value;
        } else {
          yield* entry.value.literals();
        }
      }
    }
  }
}
