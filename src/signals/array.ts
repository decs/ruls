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

  includes(value: TElement): Rule<TContext> {
    return new SignalRule(operator.$all, this, [value]);
  }

  includesAll(values: Array<TElement>): Rule<TContext> {
    return new SignalRule(operator.$all, this, values);
  }

  includesAny(values: Array<TElement>): Rule<TContext> {
    return new SignalRule(operator.$any, this, values);
  }
}
