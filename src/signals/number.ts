import type Rule from "../rules/rule";

import { operator } from "../core/operators";
import SignalRule from "../rules/signal";
import AnySignal from "./any";

export default class NumberSignal<
  TContext,
  TValue extends number
> extends AnySignal<TContext, TValue> {
  lowerThan(value: TValue): Rule<TContext> {
    return new SignalRule(operator.$lt, this, value);
  }
}
