import { describe, expect, test } from 'bun:test';
import { JSON5Object } from './JSON5Object';
import { JSON5ObjectEntry } from './JSON5ObjectEntry';
import { JSON5Literal } from './JSON5Literal';

describe('JSON5Object', () => {
  describe('getValue', () => {
    test('should return the value of a key', () => {
      const obj = new JSON5Object([
        new JSON5ObjectEntry('"', 'key1', '', '', new JSON5Literal('value1', '"'), '', ','),
        new JSON5ObjectEntry('"', 'key2', '', '', new JSON5Literal('value2', '"'), '', ','),
      ]);
      expect(obj.getValue('key1')).toEqual(new JSON5Literal('value1', '"'));
    });

    test('should return undefined for a non-existing key', () => {
      const obj = new JSON5Object([
        new JSON5ObjectEntry('"', 'key1', '', '', new JSON5Literal('value1', '"'), '', ','),
      ]);
      expect(obj.getValue('key2')).toBeUndefined();
    });
  });
  describe('addEntry', () => {
    test('should add an entry at the end', () => {
      const obj = new JSON5Object([
        '\n  ',
        new JSON5ObjectEntry('"', 'key1', '', '', new JSON5Literal('value1', '"'), '', ','),
        '\n',
      ]);
      const entry = new JSON5ObjectEntry('"', 'key2', '', '', new JSON5Literal('value2', '"'), '', ',');
      obj.addEntry(entry);
      expect(obj.toString()).toEqual(`{
  "key1":"value1",
  "key2":"value2",
}`)
    });

    test('should add an entry before a specified key', () => {
      const obj = new JSON5Object([
        '\n  ',
        new JSON5ObjectEntry('"', 'key1', '', '', new JSON5Literal('value1', '"'), '', ','),
        '\n',
      ]);
      const entry = new JSON5ObjectEntry('"', 'key2', '', '', new JSON5Literal('value2', '"'), '', ',');
      obj.addEntry(entry, { beforeKey: 'key1' });
      expect(obj.toString()).toEqual(`{
  "key2": "value2",
  "key1": "value1",
}`)
    });

  });
});
