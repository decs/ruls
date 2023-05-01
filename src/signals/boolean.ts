import type Rule from '../rules/rule';

import {operator} from '../core/operators';
import SignalRule from '../rules/signal';
import AnySignal from './any';

export default class BooleanSignal<
  TContext,
  TValue extends boolean,
> extends AnySignal<TContext, TValue> {
  isTrue(): Rule<TContext> {
    return new SignalRule(operator.$eq, this, true);
  }

  isFalse(): Rule<TContext> {
    return new SignalRule(operator.$eq, this, false);
  }
}
