import { describe, expect, test } from 'bun:test';
import { JSON5Object } from './JSON5Object';
import { JSON5ObjectEntry } from './JSON5ObjectEntry';
import { JSON5Literal } from './JSON5Literal';
import { parseJSON5 } from '../index';

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
}`);
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
  "key2":"value2",
  "key1":"value1",
}`);
    });

    test('should add entry in the middle of two entries with afterKey', () => {
      const obj = new JSON5Object([
        '\n  ',
        new JSON5ObjectEntry('"', 'key1', '', '', new JSON5Literal('value1', '"'), '', ','),
        '\n  ',
        new JSON5ObjectEntry('"', 'key3', '', '', new JSON5Literal('value3', '"'), '', ','),
        '\n',
      ]);
      const entry = new JSON5ObjectEntry('"', 'key2', '', '', new JSON5Literal('value2', '"'), '', ',');
      obj.addEntry(entry, { afterKey: 'key1' });
      expect(obj.toString()).toEqual(`{
  "key1":"value1",
  "key2":"value2",
  "key3":"value3",
}`);
    });

    test('should add entry in the middle of two entries with beforeKey', () => {
      const obj = new JSON5Object([
        '\n  ',
        new JSON5ObjectEntry('"', 'key1', '', '', new JSON5Literal('value1', '"'), '', ','),
        '\n  ',
        new JSON5ObjectEntry('"', 'key3', '', '', new JSON5Literal('value3', '"'), '', ','),
        '\n',
      ]);
      const entry = new JSON5ObjectEntry('"', 'key2', '', '', new JSON5Literal('value2', '"'), '', ',');
      obj.addEntry(entry, { beforeKey: 'key3' });
      expect(obj.toString()).toEqual(`{
  "key1":"value1",
  "key2":"value2",
  "key3":"value3",
}`);
    });
  });

  describe('addKeyValue', () => {
    test('should add a key-value pair at the end without spaces around colon', () => {
      const obj = new JSON5Object([
        '\n  ',
        new JSON5ObjectEntry('"', 'key1', '', '', new JSON5Literal('value1', '"'), '', ','),
        '\n',
      ]);
      obj.addKeyValue('key2', new JSON5Literal('value2', '"'));
      expect(obj.toString()).toEqual(`{
  "key1":"value1",
  "key2":"value2"
}`);
    });
    test('should add a key-value pair at the end with spaces around colon', () => {
      const obj = new JSON5Object([
        '\n  ',
        new JSON5ObjectEntry('', 'key1', ' ', ' ', new JSON5Literal('value1', '"'), '', ','),
        '\n',
      ]);
      obj.addKeyValue('key2', new JSON5Literal('value2', '"'));
      expect(obj.toString()).toEqual(`{
  key1 : "value1",
  key2 : "value2"
}`);
    });
    test('should add trailing comma if not last entry', () => {
      const obj = new JSON5Object([
        '\n  ',
        new JSON5ObjectEntry('', 'key1', ' ', ' ', new JSON5Literal('value1', '"'), '', ','),
        '\n',
      ]);
      obj.addKeyValue('key2', new JSON5Literal('value2', '"'), {
        beforeKey: 'key1',
      });
      expect(obj.toString()).toEqual(`{
  key2 : "value2",
  key1 : "value1",
}`);
    });
    test('should add trailing comma to previous entry if that had no comma', () => {
      const obj = new JSON5Object([
        '\n  ',
        new JSON5ObjectEntry('"', 'key1', '', ' ', new JSON5Literal('value1', '"'), '', ''),
        '\n',
      ]);
      obj.addKeyValue('key2', new JSON5Literal('value2', '"'));
      expect(obj.toString()).toEqual(`{
  "key1": "value1",
  "key2": "value2"
}`);
    });
    test('should coerce value to string if not JSON5Literal', () => {
      const obj = new JSON5Object([
        '\n  ',
        new JSON5ObjectEntry('"', 'key1', '', ' ', new JSON5Literal('value1', '"'), '', ''),
        '\n',
      ]);
      obj.addKeyValue('key2', 'value2');
      expect(obj.toString()).toEqual(`{
  "key1": "value1",
  "key2": "value2"
}`);
    });
  });

  describe('literals', () => {
    test('should return literals', () => {
      const obj = new JSON5Object([
        new JSON5ObjectEntry('"', 'key1', '', '', new JSON5Literal('value1', '"'), '', ','),
        new JSON5ObjectEntry('"', 'key2', '', '', new JSON5Literal('value2', '"'), '', ','),
      ]);
      expect(obj.literals().toArray()).toEqual([new JSON5Literal('value1', '"'), new JSON5Literal('value2', '"')]);
    });
    test('should return nested literals', () => {
      const obj = new JSON5Object([
        new JSON5ObjectEntry('"', 'key1', '', '', new JSON5Literal('value1', '"'), '', ','),
        new JSON5ObjectEntry(
          '"',
          'key2',
          '',
          '',
          new JSON5Object([
            new JSON5ObjectEntry('"', 'nestedKey', '', '', new JSON5Literal('nestedValue', '"'), '', ','),
          ]),
          '',
          ',',
        ),
      ]);
      expect(obj.literals().toArray()).toEqual([new JSON5Literal('value1', '"'), new JSON5Literal('nestedValue', '"')]);
    });
  });

  describe('setValue', () => {
    test('should set the value of a key', () => {
      const obj = new JSON5Object([new JSON5ObjectEntry('"', 'key1', '', '', new JSON5Literal('value1', '"'), '', '')]);
      obj.setValue('key1', new JSON5Literal('newValue1', '"'));
      expect(obj.toString()).toEqual(`{"key1":"newValue1"}`);
    });
    test('should add a new key-value pair if the key does not exist', () => {
      const obj = new JSON5Object([
        '\n  ',
        new JSON5ObjectEntry('"', 'key1', '', '', new JSON5Literal('value1', '"'), '', ''),
        '\n',
      ]);
      obj.setValue('key2', new JSON5Literal('value2', '"'));
      expect(obj.toString()).toEqual(`{
  "key1":"value1",
  "key2":"value2"
}`);
    });
    test('should add a new key-value pair to parsed object if the key does not exist', () => {
      const obj = parseJSON5(`{\n  "key1":"value1"\n}`).value as JSON5Object;
      obj.setValue('key2', "value2");
      expect(obj.toString()).toEqual(`{
  "key1":"value1",
  "key2":"value2"
}`);
    });
    test('should add new key-value pair with matching quotes', () => {
      const obj = new JSON5Object([
        '\n  ',
        new JSON5ObjectEntry('"', 'key1', '', '', new JSON5Literal('value1', "'"), '', ''),
        '\n',
      ]);
      obj.setValue('key2', 'value2');
      expect(obj.toString()).toEqual(`{
  "key1":'value1',
  "key2":'value2'
}`);
    });
  });
});
