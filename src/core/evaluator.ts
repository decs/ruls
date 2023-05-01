export default abstract class Evaluator<TContext, TValue> {
  constructor(protected fn: (context: TContext) => TValue) {}

  evaluate(context: TContext): TValue {
    return this.fn(context);
  }
}
