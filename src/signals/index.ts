import AnySignal from './any';
import ArraySignal from './array';
import BooleanSignal from './boolean';
import NumberSignal from './number';
import StringSignal from './string';

export type Signal<TContext, TValue> =
  | (TValue extends string ? StringSignal<TContext, TValue> : never)
  | (TValue extends number ? NumberSignal<TContext, TValue> : never)
  | (TValue extends boolean ? BooleanSignal<TContext, TValue> : never)
  | (TValue extends Array<infer TElement>
      ? ArraySignal<TContext, TElement, TValue>
      : never)
  | AnySignal<TContext, TValue>;

export type SignalSet<TContext> = Record<string, Signal<TContext, unknown>>;

export const signal = {
  any<TContext, TValue>(
    fn: (context: TContext) => TValue,
  ): AnySignal<TContext, TValue> {
    return new AnySignal(fn);
  },
  array<TContext, TElement, TValue extends Array<TElement> = Array<TElement>>(
    fn: (context: TContext) => TValue,
  ): ArraySignal<TContext, TElement, TValue> {
    return new ArraySignal(fn);
  },
  boolean<TContext, TValue extends boolean = boolean>(
    fn: (context: TContext) => TValue,
  ): BooleanSignal<TContext, TValue> {
    return new BooleanSignal(fn);
  },
  number<TContext, TValue extends number = number>(
    fn: (context: TContext) => TValue,
  ): NumberSignal<TContext, TValue> {
    return new NumberSignal(fn);
  },
  string<TContext, TValue extends string = string>(
    fn: (context: TContext) => TValue,
  ): StringSignal<TContext, TValue> {
    return new StringSignal(fn);
  },
};

export function getSignalKey<TContext, TValue>(
  // eslint-disable-next-line @typescript-eslint/no-shadow
  signal: Signal<TContext, TValue>,
  signals: SignalSet<TContext>,
): string {
  const signalKey = Object.keys(signals).find(key => signals[key] === signal);
  if (signalKey == null) {
    throw new Error();
  }
  return signalKey;
}
