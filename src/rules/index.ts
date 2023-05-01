import type Rule from './rule';

import {operator} from '../core/operators';
import GroupRule from './group';
import InverseRule from './inverse';
import parse from './parse';

export const rule = {
  all<TContext>(rules: Array<Rule<TContext>>): Rule<TContext> {
    return new GroupRule(operator.$and, rules);
  },
  any<TContext>(rules: Array<Rule<TContext>>): Rule<TContext> {
    return new GroupRule(operator.$or, rules);
  },
  none<TContext>(rules: Array<Rule<TContext>>): Rule<TContext> {
    return new InverseRule(new GroupRule(operator.$or, rules));
  },
  parse,
};
