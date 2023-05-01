import type {Signal, SignalSet} from '../signals';

import {getOperatorKey} from '../core/operators';
import {getSignalKey} from '../signals';
import Rule from './rule';

export type EncodedSignalRule = {
  [signal: string]: {[operator: string]: unknown};
};

export default class SignalRule<
  TContext,
  TFirst,
  TSecond,
> extends Rule<TContext> {
  constructor(
    protected operator: (first: TFirst, second: TSecond) => boolean,
    protected first: Signal<TContext, TFirst>,
    protected second: TSecond,
  ) {
    super(context => operator(first.evaluate(context), second));
  }

  encode(signals: SignalSet<TContext>): EncodedSignalRule {
    return {
      [getSignalKey(this.first, signals)]: {
        [getOperatorKey(this.operator)]: this.second,
      },
    };
  }
}
