[![npm](https://img.shields.io/npm/v/json5-trueformat)](https://www.npmjs.com/package/json5-trueformat)
[![Coverage Status](https://coveralls.io/repos/github/daniel-sc/json5-trueformat/badge.svg?branch=master)](https://coveralls.io/github/daniel-sc/json5-trueformat?branch=main)

# json5-trueformat

json5-trueformat is a TypeScript library for parsing, editing, and serializing JSON and [JSON5](https://json5.org/) files without losing formatting details.
It creates a custom AST that captures every comment, blank line, indentation, and other formatting details to ensure a lossless round-trip.

This library is inspired by the design of [xml-trueformat](https://github.com/daniel-sc/xml-trueformat) and is ideal for use cases where the exact layout and comment structure of JSON files must be preserved (e.g., configuration files under version control).
Enjoy seamless, non-destructive editing of your JSON files!

## Features

- **Exact Formatting Preservation** \
  Retains inline comments, blank lines, and all whitespace exactly as in the original file.

- **AST-based Editing** \
  Provides an abstract syntax tree for precise modifications. Change the value of a key or add new entries without reformatting the rest of the file.

- **Modifications** \
  Supports adding, removing, and updating keys and values in JSON5 objects and arrays. Convenient methods are provided to simplify adding entries matching the surrounding formatting.\
  See e.g. `JSON5Object.addKeyValue(key, value, options)`.

- **Support for Comments and Whitespace** \
  Captures and preserves comments and whitespace within objects and arrays.\
  See `JSON5ObjectEntry` and `JSON5ArrayElement`.

## Installation

Install the dependencies:

```bash
npm install json5-trueformat
```

## Usage

Below is an example that reads a JSON5 file, updates a value, and writes it back without changing the formatting:

```ts
import { parseJSON5, JSON5Document, JSON5Object, JSON5ObjectEntry, JSON5Literal } from 'json5-trueformat';

const input = `{
  // This is a comment
  key_without_quotes : "value with qutes",
  "key_with_quotes":'value with single quotes',
}`;

const doc = parseJSON5(input);

// expeted AST:
expect(doc).toEqual(
  new JSON5Document(
    '',
    new JSON5Object([
      '\n  // This is a comment\n  ',
      new JSON5ObjectEntry('', 'key_without_quotes', ' ', ' ', new JSON5Literal('value with qutes', '"'), '  ', ','),
      '\n  ',
      new JSON5ObjectEntry('"', 'key_with_quotes', '', '', new JSON5Literal('value with single quotes', "'"), '', ','),
      '\n',
    ]),
    '',
  ),
);

// modify the value of a key:
(doc.value as JSON5Object).entries.find((e) => e instanceof JSON5ObjectEntry)!.value.raw = 'new value';

// add a new key-value pair:
(doc.value as JSON5Object).addKeyValue('new_key', new JSON5Literal('new value', '"'));

// expect serialization to preserve the formatting:
expect(doc.toString()).toEqual(`{
  // This is a comment
  key_without_quotes: "new value",
  "key_with_quotes": 'value with single quotes',
  "new_key": "new value",
}`);
```

## Contributing

Contributions, bug reports, and feature requests are welcome!

Please open an issue or submit a pull request on the GitHub repository.
