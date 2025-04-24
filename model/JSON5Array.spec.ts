import { describe, expect, it } from 'bun:test';
import { JSON5Array } from './JSON5Array';
import { JSON5Object } from './JSON5Object';
import { JSON5ObjectEntry } from './JSON5ObjectEntry';
import { JSON5Literal } from './JSON5Literal';
import { JSON5ArrayElement } from './JSON5ArrayElement';
import { JSON5Document } from './JSON5Document';

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
  describe('guessIndentation', () => {
    it('should return the correct indentation', () => {
      const json5Array = new JSON5Array([
        '\n  ',
        new JSON5ArrayElement(
          new JSON5Object([new JSON5ObjectEntry('"', 'key1', '', '', new JSON5Literal('value1', '"'), '', ',')]),
          '',
          '',
        ),
        '\n',
      ]);
      expect(json5Array.guessIndentation()).toEqual('  ');
    });
  });
  describe('guessLineBreak', () => {
    it('should return the correct line break', () => {
      const json5Array = new JSON5Array([
        '\r\n  ',
        new JSON5ArrayElement(new JSON5Literal('value1', '"'), '', ''),
        '\r\n',
      ]);
      expect(json5Array.guessLineBreak()).toEqual('\r\n');
    });
  });
  describe('getParentObjectOrArray', () => {
    it('should return parent object', () => {
      const jsonArray = new JSON5Array([]);
      const parentObject = new JSON5Object([new JSON5ObjectEntry('"', 'key1', '', '', jsonArray, '', ',')]);
      expect(jsonArray.getParentObjectOrArray()).toBe(parentObject);
    });
    it('should return parent array', () => {
      const jsonArray = new JSON5Array([]);
      const parentArray = new JSON5Array([new JSON5ArrayElement(jsonArray, '', '')]);
      expect(jsonArray.getParentObjectOrArray()).toBe(parentArray);
    });
    it('should return undefined if no parent is object or array', () => {
      const jsonArray = new JSON5Array([]);
      const document = new JSON5Document('', jsonArray, '');
      expect(jsonArray.parent).toBe(document);
      expect(jsonArray.getParentObjectOrArray()).toBeUndefined();
    });
  });
  describe('getParentObject', () => {
    it('should return parent object', () => {
      const jsonArray = new JSON5Array([]);
      const parentObject = new JSON5Object([new JSON5ObjectEntry('"', 'key1', '', '', jsonArray, '', ',')]);
      expect(jsonArray.getParentObject()).toBe(parentObject);
    });
    it('should return undefined if no parent is object', () => {
      const jsonArray = new JSON5Array([]);
      const document = new JSON5Document('', jsonArray, '');
      expect(jsonArray.parent).toBe(document);
      expect(jsonArray.getParentObject()).toBeUndefined();
    });
  });
});
