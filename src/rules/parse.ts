import type {OperatorKey} from '../core/operators';
import type {SignalSet} from '../signals';
import type Rule from './rule';

import {operator} from '../core/operators';
import NumberSignal from '../signals/number';
import GroupRule from './group';
import InverseRule from './inverse';
import SignalRule from './signal';
import ArraySignal from '../signals/array';
import StringSignal from '../signals/string';

function assertObjectWithSingleKey(
  data: unknown,
): asserts data is {[key: string]: unknown} {
  if (data == null || typeof data !== 'object') {
    throw new Error();
  }
  if (Object.keys(data).length !== 1) {
    throw new Error();
  }
}

function assertOperatorKey(data: unknown): asserts data is OperatorKey {
  if (typeof data !== 'string') {
    throw new Error();
  }
  if (!Object.keys(operator).includes(data)) {
    throw new Error();
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
      if (!Array.isArray(value)) {
        throw new Error();
      }
      return new GroupRule<TContext>(
        operator[key],
        value.map(element => parse(element, signals)),
      );
    case '$not':
      return new InverseRule(parse(value, signals));
  }

  const signal = signals[key];
  assertObjectWithSingleKey(value);
  const operatorKey = Object.keys(value)[0];
  assertOperatorKey(operatorKey);
  const operatorValue = value[operatorKey];

  switch (operatorKey) {
    case '$and':
    case '$or':
      if (!(signal instanceof ArraySignal)) {
        throw new Error();
      }
      return new SignalRule(
        operator[operatorKey],
        signal,
        parse(operatorValue, signals) as any,
      );
    case '$not':
      throw new Error();
    case '$all':
    case '$any':
      if (!(signal instanceof ArraySignal)) {
        throw new Error();
      }
      if (!Array.isArray(operatorValue)) {
        throw new Error();
      }
      return new SignalRule(operator[operatorKey], signal, operatorValue);
    case '$inc':
    case '$pfx':
    case '$sfx':
      if (!(signal instanceof StringSignal)) {
        throw new Error();
      }
      if (typeof operatorValue !== 'string') {
        throw new Error();
      }
      return new SignalRule(operator[operatorKey], signal, operatorValue);
    case '$gt':
    case '$gte':
    case '$lt':
    case '$lte':
      if (!(signal instanceof NumberSignal)) {
        throw new Error();
      }
      if (typeof operatorValue !== 'number') {
        throw new Error();
      }
      return new SignalRule(operator[operatorKey], signal, operatorValue);
    case '$eq':
      return new SignalRule(operator[operatorKey], signal, operatorValue);
    case '$in':
      if (!Array.isArray(operatorValue)) {
        throw new Error();
      }
      return new SignalRule(operator[operatorKey], signal, operatorValue);
  }
}
