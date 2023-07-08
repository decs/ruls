import type Rule from '../rules/rule';
import type {Schema} from '@decs/typeschema';

import {assert} from '@decs/typeschema';

import {operator} from '../core/operators';
import InverseRule from '../rules/inverse';
import SignalRule from '../rules/signal';

export type Signal<TContext, TValue> = {
  _schema: Schema<TValue>;
  evaluate: (context: TContext) => Promise<TValue>;
  not: Omit<Signal<TContext, TValue>, 'evaluate' | 'not'>;
  equals(value: TValue): Rule<TContext>;
  in(values: Array<TValue>): Rule<TContext>;
} & (TValue extends Array<infer TElement>
  ? {
      every(rule: Rule<TElement>): Rule<TContext>;
      some(rule: Rule<TElement>): Rule<TContext>;
      contains(value: TElement): Rule<TContext>;
      containsEvery(values: Array<TElement>): Rule<TContext>;
      containsSome(values: Array<TElement>): Rule<TContext>;
    }
  : TValue extends boolean
  ? {
      isTrue(): Rule<TContext>;
      isFalse(): Rule<TContext>;
    }
  : TValue extends number
  ? {
      lessThan(value: TValue): Rule<TContext>;
      lessThanOrEquals(value: TValue): Rule<TContext>;
      greaterThan(value: TValue): Rule<TContext>;
      greaterThanOrEquals(value: TValue): Rule<TContext>;
    }
  : TValue extends string
  ? {
      includes(value: TValue): Rule<TContext>;
      endsWith(value: TValue): Rule<TContext>;
      startsWith(value: TValue): Rule<TContext>;
      matches(value: RegExp): Rule<TContext>;
    }
  : Record<string, never>);

export type SignalFactory<TValue> = {
  _schema: Schema<TValue>;
  value: <TContext>(
    fn: (context: TContext) => TValue | Promise<TValue>,
  ) => Signal<TContext, TValue>;
};

function createSignal<TContext, TValue>(
  schema: Schema<TValue>,
  fn: (context: TContext) => TValue | Promise<TValue>,
): Signal<TContext, TValue> {
  return {
    _schema: schema,
    evaluate: async context => assert(schema, await fn(context)),
  } as Signal<TContext, TValue>;
}

function addOperators<TContext, TValue>(
  signal: Signal<TContext, TValue>,
): Signal<TContext, TValue> {
  return {
    ...signal,
    equals: value => new SignalRule(operator.$eq, signal, value),
    in: values => new SignalRule(operator.$in, signal, values),
  };
}

function addArrayOperators<TContext, TValue>(
  signal: Signal<TContext, TValue>,
): Signal<TContext, TValue> {
  const arraySignal = signal as unknown as Signal<TContext, Array<unknown>>;
  return {
    ...signal,
    contains: value => new SignalRule(operator.$all, arraySignal, [value]),
    containsEvery: values => new SignalRule(operator.$all, arraySignal, values),
    containsSome: values => new SignalRule(operator.$any, arraySignal, values),
    every: rule => new SignalRule(operator.$and, arraySignal, [rule]),
    some: rule => new SignalRule(operator.$or, arraySignal, [rule]),
  };
}

function addBooleanOperators<TContext, TValue>(
  signal: Signal<TContext, TValue>,
): Signal<TContext, TValue> {
  const booleanSignal = signal as unknown as Signal<TContext, boolean>;
  return {
    ...signal,
    isFalse: () => new SignalRule(operator.$eq, booleanSignal, false),
    isTrue: () => new SignalRule(operator.$eq, booleanSignal, true),
  };
}

function addNumberOperators<TContext, TValue>(
  signal: Signal<TContext, TValue>,
): Signal<TContext, TValue> {
  const numberSignal = signal as unknown as Signal<TContext, number>;
  return {
    ...signal,
    greaterThan: value => new SignalRule(operator.$gt, numberSignal, value),
    greaterThanOrEquals: value =>
      new SignalRule(operator.$gte, numberSignal, value),
    lessThan: value => new SignalRule(operator.$lt, numberSignal, value),
    lessThanOrEquals: value =>
      new SignalRule(operator.$lte, numberSignal, value),
  };
}

function addStringOperators<TContext, TValue>(
  signal: Signal<TContext, TValue>,
): Signal<TContext, TValue> {
  const stringSignal = signal as unknown as Signal<TContext, string>;
  return {
    ...signal,
    endsWith: value => new SignalRule(operator.$sfx, stringSignal, value),
    includes: value => new SignalRule(operator.$inc, stringSignal, value),
    matches: value => new SignalRule(operator.$rx, stringSignal, value),
    startsWith: value => new SignalRule(operator.$pfx, stringSignal, value),
  };
}

function addModifiers<TContext, TValue>(
  signal: Signal<TContext, TValue>,
): Signal<TContext, TValue> {
  return {
    ...signal,
    not: new Proxy(signal, {
      get: (target, property, receiver) => {
        const value = Reflect.get(target, property, receiver);
        return typeof value === 'function'
          ? (...args: Array<unknown>) =>
              new InverseRule(value.bind(target)(...args))
          : value;
      },
    }),
  };
}

export function type<TValue>(schema: Schema<TValue>): SignalFactory<TValue> {
  return {
    _schema: schema,
    value<TContext>(fn: (context: TContext) => TValue | Promise<TValue>) {
      return [
        addOperators,
        addArrayOperators,
        addBooleanOperators,
        addNumberOperators,
        addStringOperators,
        addModifiers,
      ].reduce(
        (value, operation) => operation(value),
        createSignal(schema, fn),
      );
    },
  };
}
