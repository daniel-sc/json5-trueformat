import { describe, expect, it } from 'bun:test';
import { JSON5Array } from './JSON5Array';
import { JSON5Object } from './JSON5Object';
import { JSON5ObjectEntry } from './JSON5ObjectEntry';
import { JSON5Literal } from './JSON5Literal';
import { JSON5ArrayElement } from './JSON5ArrayElement';

describe('JSON5Array', () => {
  describe('literals', () => {
    it('should return nested literals', () => {
      const json5Array = new JSON5Array([
        new JSON5ArrayElement(
          new JSON5Object([new JSON5ObjectEntry('"', 'key1', '', '', new JSON5Literal('value1', '"'), '', ',')]),
          '',
          '',
        ),
      ]);
      expect(json5Array.literals().toArray()).toEqual([new JSON5Literal('value1', '"')]);
    });
  });
});
