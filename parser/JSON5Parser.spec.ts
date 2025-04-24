import { expect, test } from 'bun:test';
import { JSON5Document, parseJSON5 } from '../index';
import { JSON5Object } from '../model/JSON5Object';
import { JSON5ObjectEntry } from '../model/JSON5ObjectEntry';
import { JSON5Literal } from '../model/JSON5Literal';

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

test('readme example', () => {
  const input = `{
  // This is a comment
  key_without_quotes : "value with qutes"  ,
  "key_with_quotes":'value with single quotes',
}`;
  const doc = parseJSON5(input);
  expect(doc).toEqual(
    new JSON5Document(
      '',
      new JSON5Object([
        '\n  // This is a comment\n  ',
        new JSON5ObjectEntry('', 'key_without_quotes', ' ', ' ', new JSON5Literal('value with qutes', '"'), '  ', ','),
        '\n  ',
        new JSON5ObjectEntry(
          '"',
          'key_with_quotes',
          '',
          '',
          new JSON5Literal('value with single quotes', "'"),
          '',
          ',',
        ),
        '\n',
      ]),
      '',
    ),
  );
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

test('round trip windows line endings', () => {
  const input = `{\r\n  key: "value"\r\n}`;
  const doc = parseJSON5(input);
  expect(doc.toString()).toEqual(input);
});

test('Modification: Update a value in JSON5 Object', () => {
  const input = `{
  key: "old value"
}`;
  const doc = parseJSON5(input);
  // Assume doc.value is a JSON5Object.
  const entry = (doc.value as JSON5Object).entries.find((e) => e instanceof JSON5ObjectEntry)!;
  // If the value is a literal representing a string, update its raw value.
  if (entry.value instanceof JSON5Literal) {
    // Preserve surrounding whitespace; only update the content inside the quotes.
    entry.value.raw = 'new value';
  }
  const output = doc.toString();
  const expected = `{
  key: "new value"
}`;
  expect(output).toBe(expected);
});
