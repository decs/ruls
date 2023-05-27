import type {Signal} from './factory';

import {type} from './factory';

export type {Signal} from './factory';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SignalSet<TContext> = Record<string, Signal<TContext, any>>;

export const signal = {
  any<TContext, TValue>(
    fn: (context: TContext) => TValue | Promise<TValue>,
  ): Signal<TContext, TValue> {
    return type(value => value as TValue).value(fn);
  },
  array<TContext, TElement>(
    fn: (context: TContext) => Array<TElement> | Promise<Array<TElement>>,
  ): Signal<TContext, Array<TElement>> {
    return type(value => {
      if (!Array.isArray(value)) {
        throw new Error();
      }
      return value;
    }).value(fn);
  },
  boolean<TContext>(
    fn: (context: TContext) => boolean | Promise<boolean>,
  ): Signal<TContext, boolean> {
    return type(value => {
      if (typeof value !== 'boolean') {
        throw new Error();
      }
      return value;
    }).value(fn);
  },
  number<TContext>(
    fn: (context: TContext) => number | Promise<number>,
  ): Signal<TContext, number> {
    return type(value => {
      if (typeof value !== 'number') {
        throw new Error();
      }
      return value;
    }).value(fn);
  },
  string<TContext>(
    fn: (context: TContext) => string | Promise<string>,
  ): Signal<TContext, string> {
    return type(value => {
      if (typeof value !== 'string') {
        throw new Error();
      }
      return value;
    }).value(fn);
  },
  type,
};

export function getSignalKey<TContext, TValue>(
  // eslint-disable-next-line @typescript-eslint/no-shadow
  signal: Signal<TContext, TValue>,
  signals: SignalSet<TContext>,
): string {
  const signalKey = Object.keys(signals).find(
    key => signals[key].equals === signal.equals,
  );
  if (signalKey == null) {
    throw new Error();
  }
  return signalKey;
}
