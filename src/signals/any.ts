import type Rule from "../rules/rule";

import Evaluator from "../core/evaluator";
import { operator } from "../core/operators";
import InverseRule from "../rules/inverse";
import SignalRule from "../rules/signal";

export default class AnySignal<TContext, TValue> extends Evaluator<
  TContext,
  TValue
> {
  public not: Omit<this, keyof Evaluator<TContext, TValue> | "not"> = new Proxy(
    this,
    {
      get: (target, property) => {
        const value = target[property as keyof typeof target];
        if (typeof value !== "function") {
          return value;
        }
        return (...args: Array<unknown>) =>
          new InverseRule(value.bind(target)(...args));
      },
    }
  );

  equals(value: TValue): Rule<TContext> {
    return new SignalRule(operator.$eq, this, value);
  }

  in(values: Array<TValue>): Rule<TContext> {
    return new SignalRule(operator.$in, this, values);
  }
}
