/***********************************************************************
 * Bun Tests
 ***********************************************************************/
import { expect, test } from 'bun:test';
import { JSON5Literal, JSON5Object, parseJSON5 } from './index';

test('Round-trip: Simple JSON5 literal', () => {
  const input = '  true  ';
  const doc = parseJSON5(input);
  expect(doc.toString()).toBe(input);
});

test('Round-trip: JSON5 Object with comments and whitespace', () => {
  const input = `{
  // comment before key
  "key1": "value1", /* inline comment */
  key2: 42,
}`;
  const doc = parseJSON5(input);
  expect(doc.toString()).toBe(input);
});

test('Round-trip: JSON5 Array with trailing commas', () => {
  const input = `[
  1,
  2,
  3, // trailing comma
]`;
  const doc = parseJSON5(input);
  expect(doc.toString()).toBe(input);
});

test('Modification: Update a value in JSON5 Object', () => {
  const input = `{
  key: "old value"
}`;
  const doc = parseJSON5(input);
  // Assume doc.value is a JSON5Object.
  if (doc.value instanceof JSON5Object && doc.value.entries.length > 0) {
    const entry = doc.value.entries[0]!;
    // If the value is a literal representing a string, update its raw value.
    if (entry.value instanceof JSON5Literal) {
      // Preserve surrounding whitespace; only update the content inside the quotes.
      // Here we assume the literal is quoted.
      const raw = entry.value.raw;
      const quote = raw[0]; // opening quote
      entry.value.raw = quote + 'new value' + quote;
    }
  }
  const output = doc.toString();
  const expected = `{
  key: "new value"
}`;
  expect(output).toBe(expected);
});
