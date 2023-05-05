import type Rule from '../rules/rule';

import {operator} from '../core/operators';
import SignalRule from '../rules/signal';
import AnySignal from './any';

export default class NumberSignal<
  TContext,
  TValue extends number,
> extends AnySignal<TContext, TValue> {
  lowerThan(value: TValue): Rule<TContext> {
    return new SignalRule(operator.$lt, this, value);
  }

  lowerThanOrEquals(value: TValue): Rule<TContext> {
    return new SignalRule(operator.$lte, this, value);
  }

  greaterThan(value: TValue): Rule<TContext> {
    return new SignalRule(operator.$gt, this, value);
  }

  greaterThanOrEquals(value: TValue): Rule<TContext> {
    return new SignalRule(operator.$gte, this, value);
  }
}
