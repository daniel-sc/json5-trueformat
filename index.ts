import { JSON5Parser } from './parser/JSON5Parser';
import { JSON5Document } from './model/JSON5Document';

/***********************************************************************
 * Exported function to parse a JSON5 string.
 ***********************************************************************/
export function parseJSON5(text: string): JSON5Document {
  const parser = new JSON5Parser(text);
  return parser.parseDocument();
}

export * from './model/JSON5Array';
export * from './model/JSON5ArrayElement';
export * from './model/JSON5Document';
export * from './model/JSON5Literal';
export * from './model/JSON5Object';
export * from './model/JSON5ObjectEntry';
export * from './model/JSON5Value';
export * from './model/whiteSpaceOrComment';
