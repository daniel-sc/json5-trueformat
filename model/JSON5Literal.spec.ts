import { describe, expect, it } from 'bun:test';
import { JSON5Literal } from './JSON5Literal';

describe('JSON5Literal', () => {
  describe('fromPrimitive', () => {
    it('should return null for null', () => {
      expect(JSON5Literal.fromPrimitive(null)).toEqual(new JSON5Literal('null', ''));
    });
    it('should return number literal', () => {
      expect(JSON5Literal.fromPrimitive(1)).toEqual(new JSON5Literal('1', ''));
    });
    it('should return fractional number', () => {
      expect(JSON5Literal.fromPrimitive(1.2)).toEqual(new JSON5Literal('1.2', ''));
    });
    it('should return string literal', () => {
      expect(JSON5Literal.fromPrimitive('test')).toEqual(new JSON5Literal('test', '"'));
    });
    it('should escape double quote in string literal', () => {
      expect(JSON5Literal.fromPrimitive('test"')).toEqual(new JSON5Literal('test\\"', '"'));
    });
    it('should not escape double quote in single quote string literal', () => {
      expect(JSON5Literal.fromPrimitive('test"', "'")).toEqual(new JSON5Literal('test"', "'"));
    });
    it('should escape single quote in string literal', () => {
      expect(JSON5Literal.fromPrimitive("test'", "'")).toEqual(new JSON5Literal("test\\'", "'"));
    });
    it('should not escape single quote in double quoted string literal', () => {
      expect(JSON5Literal.fromPrimitive("test'", '"')).toEqual(new JSON5Literal("test'", '"'));
    });
    it('should escape json special chars', () => {
      expect(JSON5Literal.fromPrimitive('test\n\r\b\f\t\\')).toEqual(new JSON5Literal('test\\n\\r\\b\\f\\t\\\\', '"'));
    });
    it('should return boolean true', () => {
      expect(JSON5Literal.fromPrimitive(true)).toEqual(new JSON5Literal('true', ''));
    });
    it('should return boolean false', () => {
      expect(JSON5Literal.fromPrimitive(false)).toEqual(new JSON5Literal('false', ''));
    });
    it('should throw on unexpected type', () => {
      expect(() => JSON5Literal.fromPrimitive({} as any)).toThrow('Invalid primitive type');
    });
  });
  describe('toPrimitive', () => {
    it('should return null for null', () => {
      expect(new JSON5Literal('null', '').toPrimitive()).toEqual(null);
    });
    it('should return null string as string', () => {
      expect(new JSON5Literal('null', '"').toPrimitive()).toEqual('null');
    });
    it('should return number literal', () => {
      expect(new JSON5Literal('1', '').toPrimitive()).toEqual(1);
    });
    it('should return fractional number', () => {
      expect(new JSON5Literal('1.2', '').toPrimitive()).toEqual(1.2);
    });
    it('should return number string as string', () => {
      expect(new JSON5Literal('1', '"').toPrimitive()).toEqual('1');
    });
    it('should return string literal', () => {
      expect(new JSON5Literal('test', '"').toPrimitive()).toEqual('test');
    });
    it('should return escaped string literal', () => {
      expect(new JSON5Literal('test\\"', '"').toPrimitive()).toEqual('test"');
    });
    it('should return escaped single quote in string literal', () => {
      expect(new JSON5Literal("test\\'", "'").toPrimitive()).toEqual("test'");
    });
    it('should return escaped json special chars', () => {
      expect(new JSON5Literal('test\\n\\r\\b\\f\\t\\\\', '"').toPrimitive()).toEqual('test\n\r\b\f\t\\');
    });
  });
});
