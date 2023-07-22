import type {Signal, SignalSet} from '../signals';

import {getOperatorKey} from '../core/operators';
import {getSignalKey} from '../signals/set';
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
    protected operator: (
      first: TFirst,
      second: TSecond,
    ) => boolean | Promise<boolean>,
    protected first: Signal<TContext, TFirst>,
    protected second: TSecond,
  ) {
    super(async context => operator(await first.evaluate(context), second));
  }

  encode(signals: SignalSet<TContext>): EncodedSignalRule {
    return {
      [getSignalKey(this.first, signals)]: {
        [getOperatorKey(this.operator)]:
          this.second instanceof Rule
            ? this.second.encode(signals)
            : this.second instanceof RegExp
            ? this.second.toString()
            : this.second,
      },
    };
  }
}
