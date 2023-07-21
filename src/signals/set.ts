import type {Signal} from './factory';
import type {Schema} from '@decs/typeschema';

export type SignalSet<TContext> = Record<string, Signal<TContext, Schema>>;

export function getSignalKey<TContext>(
  signal: Signal<TContext, Schema>,
  signals: SignalSet<TContext>,
): string {
  const signalKey = Object.keys(signals).find(
    key => signals[key].equals === signal.equals,
  );
  if (signalKey == null) {
    throw new Error('Invalid signal: ' + signal.evaluate);
  }
  return signalKey;
}
