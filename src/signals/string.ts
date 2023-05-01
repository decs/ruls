import AnySignal from "./any";

export default class StringSignal<
  TContext,
  TValue extends string
> extends AnySignal<TContext, TValue> {}
