import type {SignalSet} from '../signals';
import type {EncodedRule} from './rule';

import {operator} from '../core/operators';
import Rule from './rule';

export type EncodedInverseRule<TContext> = {
  $not: EncodedRule<TContext>;
};

export default class InverseRule<TContext> extends Rule<TContext> {
  constructor(protected rule: Rule<TContext>) {
    super(async context => operator.$not(await rule.evaluate(context)));
  }

  encode(signals: SignalSet<TContext>): EncodedInverseRule<TContext> {
    return {$not: this.rule.encode(signals)};
  }
}
