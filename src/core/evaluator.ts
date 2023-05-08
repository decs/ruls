export default abstract class Evaluator<TContext, TValue> {
  constructor(protected fn: (context: TContext) => TValue | Promise<TValue>) {}

  async evaluate(context: TContext): Promise<TValue> {
    return this.fn(context);
  }
}
