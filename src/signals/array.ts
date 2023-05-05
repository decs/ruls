import {operator} from '../core/operators';
import Rule from '../rules/rule';
import SignalRule from '../rules/signal';
import AnySignal from './any';

export default class ArraySignal<
  TContext,
  TElement,
  TValue extends Array<TElement>,
> extends AnySignal<TContext, TValue> {
  all(rule: Rule<TElement>): Rule<TContext> {
    return new SignalRule(operator.$and, this, [rule]);
  }

  any(rule: Rule<TElement>): Rule<TContext> {
    return new SignalRule(operator.$or, this, [rule]);
  }
}
