import {operator} from '../core/operators';
import Rule from '../rules/rule';
import SignalRule from '../rules/signal';
import AnySignal from './any';

export default class ArraySignal<TContext, TValue> extends AnySignal<
  TContext,
  Array<TValue>
> {
  all(rule: Rule<TValue>): Rule<TContext> {
    return new SignalRule(operator.$and, this, rule);
  }

  any(rule: Rule<TValue>): Rule<TContext> {
    return new SignalRule(operator.$or, this, rule);
  }
}
