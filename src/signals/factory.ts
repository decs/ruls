import type Rule from '../rules/rule';

import {operator} from '../core/operators';
import InverseRule from '../rules/inverse';
import SignalRule from '../rules/signal';

export type Signal<TContext, TValue> = {
  _assert: (value: unknown) => TValue;
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
      lowerThan(value: TValue): Rule<TContext>;
      lowerThanOrEquals(value: TValue): Rule<TContext>;
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
  value: <TContext>(
    fn: (context: TContext) => TValue | Promise<TValue>,
  ) => Signal<TContext, TValue>;
};

export function type<TValue>(
  assert: (value: unknown) => TValue,
): SignalFactory<TValue> {
  return {
    value<TContext>(fn: (context: TContext) => TValue | Promise<TValue>) {
      let signal = {
        _assert: assert,
        evaluate: async context => assert(fn(context)),
      } as Signal<TContext, TValue>;
      signal = {
        ...signal,
        equals: value => new SignalRule(operator.$eq, signal, value),
        in: values => new SignalRule(operator.$in, signal, values),
      };

      const arraySignal = signal as unknown as Signal<TContext, Array<unknown>>;
      signal = {
        ...signal,
        contains: value => new SignalRule(operator.$all, arraySignal, [value]),
        containsEvery: values =>
          new SignalRule(operator.$all, arraySignal, values),
        containsSome: values =>
          new SignalRule(operator.$any, arraySignal, values),
        every: rule => new SignalRule(operator.$and, arraySignal, [rule]),
        some: rule => new SignalRule(operator.$or, arraySignal, [rule]),
      };

      const booleanSignal = signal as unknown as Signal<TContext, boolean>;
      signal = {
        ...signal,
        isFalse: () => new SignalRule(operator.$eq, booleanSignal, false),
        isTrue: () => new SignalRule(operator.$eq, booleanSignal, true),
      };

      const numberSignal = signal as unknown as Signal<TContext, number>;
      signal = {
        ...signal,
        greaterThan: value => new SignalRule(operator.$gt, numberSignal, value),
        greaterThanOrEquals: value =>
          new SignalRule(operator.$gte, numberSignal, value),
        lowerThan: value => new SignalRule(operator.$lt, numberSignal, value),
        lowerThanOrEquals: value =>
          new SignalRule(operator.$lte, numberSignal, value),
      };

      const stringSignal = signal as unknown as Signal<TContext, string>;
      signal = {
        ...signal,
        endsWith: value => new SignalRule(operator.$sfx, stringSignal, value),
        includes: value => new SignalRule(operator.$inc, stringSignal, value),
        matches: value => new SignalRule(operator.$rx, stringSignal, value),
        startsWith: value => new SignalRule(operator.$pfx, stringSignal, value),
      };

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
    },
  };
}
