import { JSON5Object } from './JSON5Object';
import { JSON5Array } from './JSON5Array';
import { JSON5Literal } from './JSON5Literal';

/** Type union for JSON5 values (object, array, or literal) */
export type JSON5Value = JSON5Object | JSON5Array | JSON5Literal;
