import type {Signal} from './factory';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SignalSet<TContext> = Record<string, Signal<TContext, any>>;

export function getSignalKey<TContext, TValue>(
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
