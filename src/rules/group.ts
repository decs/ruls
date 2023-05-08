import type {SignalSet} from '../signals';
import type {EncodedRule} from './rule';

import {getOperatorKey} from '../core/operators';
import Rule from './rule';

export type EncodedGroupRule<TContext> = {
  [operator: string]: Array<EncodedRule<TContext>>;
};

export default class GroupRule<TContext> extends Rule<TContext> {
  constructor(
    protected operator: (
      context: Array<TContext>,
      rules: Array<Rule<TContext>>,
    ) => Promise<boolean>,
    protected rules: Array<Rule<TContext>>,
  ) {
    super(context => operator([context], rules));
  }

  encode(signals: SignalSet<TContext>): EncodedGroupRule<TContext> {
    return {
      [getOperatorKey(this.operator)]: this.rules.map(rule =>
        rule.encode(signals),
      ),
    };
  }
}
