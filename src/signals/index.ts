import type {SignalFactory} from './factory';

import {
  assertArray,
  assertBoolean,
  assertNumber,
  assertString,
} from '../core/assert';
import {type} from './factory';

export type {Signal} from './factory';
export type {SignalSet} from './set';

export const signal = {
  array: <TElement>(
    assert: ((element: unknown) => TElement) | SignalFactory<TElement>,
  ) =>
    type(value =>
      assertArray<TElement>(value).map(
        '_assert' in assert ? assert._assert : assert,
      ),
    ),
  boolean: type(assertBoolean),
  number: type(assertNumber),
  string: type(assertString),
  type,
};
