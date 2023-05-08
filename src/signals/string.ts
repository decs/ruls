import type Rule from '../rules/rule';

import {operator} from '../core/operators';
import SignalRule from '../rules/signal';
import AnySignal from './any';

export default class StringSignal<
  TContext,
  TValue extends string,
> extends AnySignal<TContext, TValue> {
  endsWith(value: TValue): Rule<TContext> {
    return new SignalRule(operator.$sfx, this, value);
  }

  matches(value: RegExp): Rule<TContext> {
    return new SignalRule(operator.$rx, this, value);
  }

  includes(value: TValue): Rule<TContext> {
    return new SignalRule(operator.$inc, this, value);
  }

  startsWith(value: TValue): Rule<TContext> {
    return new SignalRule(operator.$pfx, this, value);
  }
}
