import AnySignal from './any';
import BooleanSignal from './boolean';
import NumberSignal from './number';
import StringSignal from './string';

export type Signal<TContext, TValue> =
  | (TValue extends string ? StringSignal<TContext, TValue> : never)
  | (TValue extends number ? NumberSignal<TContext, TValue> : never)
  | (TValue extends boolean ? BooleanSignal<TContext, TValue> : never)
  | AnySignal<TContext, TValue>;

export type SignalSet<TContext> = Record<string, Signal<TContext, unknown>>;

export const signal = {
  string<TContext, TValue extends string = string>(
    fn: (context: TContext) => TValue,
  ): StringSignal<TContext, TValue> {
    return new StringSignal(fn);
  },
  number<TContext, TValue extends number = number>(
    fn: (context: TContext) => TValue,
  ): NumberSignal<TContext, TValue> {
    return new NumberSignal(fn);
  },
  boolean<TContext, TValue extends boolean = boolean>(
    fn: (context: TContext) => TValue,
  ): BooleanSignal<TContext, TValue> {
    return new BooleanSignal(fn);
  },
  any<TContext, TValue>(
    fn: (context: TContext) => TValue,
  ): AnySignal<TContext, TValue> {
    return new AnySignal(fn);
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
