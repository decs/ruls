import type {Signal} from './factory';

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
  any<TContext, TValue>(
    fn: (context: TContext) => TValue | Promise<TValue>,
  ): Signal<TContext, TValue> {
    return type(value => value as TValue).value(fn);
  },
  array<TContext, TElement>(
    fn: (context: TContext) => Array<TElement> | Promise<Array<TElement>>,
  ): Signal<TContext, Array<TElement>> {
    return type(assertArray<TElement>).value(fn);
  },
  boolean<TContext>(
    fn: (context: TContext) => boolean | Promise<boolean>,
  ): Signal<TContext, boolean> {
    return type(assertBoolean).value(fn);
  },
  number<TContext>(
    fn: (context: TContext) => number | Promise<number>,
  ): Signal<TContext, number> {
    return type(assertNumber).value(fn);
  },
  string<TContext>(
    fn: (context: TContext) => string | Promise<string>,
  ): Signal<TContext, string> {
    return type(assertString).value(fn);
  },
  type,
};
