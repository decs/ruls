import type RuleType from './rule';

import {operator} from '../core/operators';
import GroupRule from './group';
import InverseRule from './inverse';
import parse from './parse';

export const rule = {
  every<TContext>(rules: Array<RuleType<TContext>>): RuleType<TContext> {
    return new GroupRule(operator.$and, rules);
  },
  none<TContext>(rules: Array<RuleType<TContext>>): RuleType<TContext> {
    return new InverseRule(new GroupRule(operator.$or, rules));
  },
  parse,
  some<TContext>(rules: Array<RuleType<TContext>>): RuleType<TContext> {
    return new GroupRule(operator.$or, rules);
  },
};

/**
 * Allows you to define complex conditions and criteria for decision-making. It
 * consists of one or more signals, which can be combined using logical
 * operators to create intricate structures.
 * 
 * Takes a TContext argument which encapsulates the necessary information
 * required by signals to make decisions and determine the outcome of rules.
 */
export type Rule <TContext> = RuleType<TContext>;
