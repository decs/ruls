import type {OperatorKey} from '../core/operators';
import type {Signal, SignalSet} from '../signals';
import type Rule from './rule';

import {assertArray, assertString} from '../core/assert';
import {operator} from '../core/operators';
import GroupRule from './group';
import InverseRule from './inverse';
import SignalRule from './signal';

function assertObjectWithSingleKey(
  data: unknown,
): asserts data is {[key: string]: unknown} {
  if (data == null || typeof data !== 'object') {
    throw new Error('Expected an object, got: ' + data);
  }
  if (Object.keys(data).length !== 1) {
    throw new Error('Expected an object with a single key, got: ' + data);
  }
}

function assertOperatorKey(data: unknown): asserts data is OperatorKey {
  if (!Object.keys(operator).includes(assertString(data))) {
    throw new Error('Expected an operator key, got: ' + data);
  }
}

export default function parse<TContext>(
  data: unknown,
  signals: SignalSet<TContext>,
): Rule<TContext> {
  assertObjectWithSingleKey(data);
  const key = Object.keys(data)[0];
  const value = data[key];

  switch (key) {
    case '$and':
    case '$or':
      return new GroupRule<TContext>(
        operator[key],
        assertArray(value).map(element => parse(element, signals)),
      );
    case '$not':
      return new InverseRule(parse(value, signals));
  }

  const signal = signals[key];
  assertObjectWithSingleKey(value);
  const operatorKey = Object.keys(value)[0];
  assertOperatorKey(operatorKey);
  const operatorValue = value[operatorKey];

  const arraySignal = signal as Signal<TContext, Array<unknown>>;
  const numberSignal = signal as Signal<TContext, number>;
  const stringSignal = signal as Signal<TContext, string>;

  switch (operatorKey) {
    case '$and':
    case '$or':
      return new SignalRule<TContext, Array<TContext>, Array<Rule<TContext>>>(
        operator[operatorKey],
        signal as Signal<TContext, Array<TContext>>,
        [parse(operatorValue, signals)],
      );
    case '$not':
      throw new Error('Invalid operator key: ' + operatorKey);
    case '$all':
    case '$any':
      return new SignalRule(
        operator[operatorKey],
        arraySignal,
        arraySignal._assert(operatorValue),
      );
    case '$inc':
    case '$pfx':
    case '$sfx':
      return new SignalRule(
        operator[operatorKey],
        stringSignal,
        stringSignal._assert(operatorValue),
      );
    case '$rx':
      const match = stringSignal
        ._assert(operatorValue)
        .match(new RegExp('^/(.*?)/([dgimsuy]*)$'));
      if (match == null) {
        throw new Error('Expected a regular expression, got: ' + operatorValue);
      }
      return new SignalRule(
        operator[operatorKey],
        signal,
        new RegExp(match[1], match[2]),
      );
    case '$gt':
    case '$gte':
    case '$lt':
    case '$lte':
      return new SignalRule(
        operator[operatorKey],
        numberSignal,
        numberSignal._assert(operatorValue),
      );
    case '$eq':
      return new SignalRule(operator[operatorKey], signal, operatorValue);
    case '$in':
      return new SignalRule(
        operator[operatorKey],
        signal,
        assertArray(operatorValue),
      );
  }
}
