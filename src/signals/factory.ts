import type Rule from '../rules/rule';
import type {Infer, Schema} from '@decs/typeschema';

import {assert} from '@decs/typeschema';

import {operator} from '../core/operators';
import InverseRule from '../rules/inverse';
import SignalRule from '../rules/signal';

export type Signal<TContext, TSchema extends Schema> = {
  _schema: TSchema;
  evaluate: (context: TContext) => Promise<Infer<TSchema>>;
  not: Omit<Signal<TContext, TSchema>, 'evaluate' | 'not'>;
  equals(value: Infer<TSchema>): Rule<TContext>;
  in(values: Array<Infer<TSchema>>): Rule<TContext>;
} & (Infer<TSchema> extends Array<infer TElement>
  ? {
      every(rule: Rule<TElement>): Rule<TContext>;
      some(rule: Rule<TElement>): Rule<TContext>;
      contains(value: TElement): Rule<TContext>;
      containsEvery(values: Array<TElement>): Rule<TContext>;
      containsSome(values: Array<TElement>): Rule<TContext>;
    }
  : Infer<TSchema> extends boolean
  ? {
      isTrue(): Rule<TContext>;
      isFalse(): Rule<TContext>;
    }
  : Infer<TSchema> extends number
  ? {
      lessThan(value: Infer<TSchema>): Rule<TContext>;
      lessThanOrEquals(value: Infer<TSchema>): Rule<TContext>;
      greaterThan(value: Infer<TSchema>): Rule<TContext>;
      greaterThanOrEquals(value: Infer<TSchema>): Rule<TContext>;
    }
  : Infer<TSchema> extends string
  ? {
      includes(value: Infer<TSchema>): Rule<TContext>;
      endsWith(value: Infer<TSchema>): Rule<TContext>;
      startsWith(value: Infer<TSchema>): Rule<TContext>;
      matches(value: RegExp): Rule<TContext>;
    }
  : Record<string, never>);

export type SignalFactory<TSchema extends Schema> = {
  _schema: TSchema;
  value: <TContext>(
    fn: (context: TContext) => Infer<TSchema> | Promise<Infer<TSchema>>,
  ) => Signal<TContext, TSchema>;
};

function createSignal<TContext, TSchema extends Schema>(
  schema: TSchema,
  fn: (context: TContext) => Infer<TSchema> | Promise<Infer<TSchema>>,
): Signal<TContext, TSchema> {
  return {
    _schema: schema,
    evaluate: async context => assert(schema, await fn(context)),
  } as Signal<TContext, TSchema>;
}

function addOperators<TContext, TSchema extends Schema>(
  signal: Signal<TContext, TSchema>,
): Signal<TContext, TSchema> {
  return {
    ...signal,
    equals: value => new SignalRule(operator.$eq, signal, value),
    in: values => new SignalRule(operator.$in, signal, values),
  };
}

function addArrayOperators<TContext, TSchema extends Schema>(
  signal: Signal<TContext, TSchema>,
): Signal<TContext, TSchema> {
  const arraySignal = signal as unknown as Signal<
    TContext,
    Schema<Array<unknown>>
  >;
  return {
    ...signal,
    contains: value => new SignalRule(operator.$all, arraySignal, [value]),
    containsEvery: values => new SignalRule(operator.$all, arraySignal, values),
    containsSome: values => new SignalRule(operator.$any, arraySignal, values),
    every: rule => new SignalRule(operator.$and, arraySignal, [rule]),
    some: rule => new SignalRule(operator.$or, arraySignal, [rule]),
  };
}

function addBooleanOperators<TContext, TSchema extends Schema>(
  signal: Signal<TContext, TSchema>,
): Signal<TContext, TSchema> {
  const booleanSignal = signal as unknown as Signal<TContext, Schema<boolean>>;
  return {
    ...signal,
    isFalse: () => new SignalRule(operator.$eq, booleanSignal, false),
    isTrue: () => new SignalRule(operator.$eq, booleanSignal, true),
  };
}

function addNumberOperators<TContext, TSchema extends Schema>(
  signal: Signal<TContext, TSchema>,
): Signal<TContext, TSchema> {
  const numberSignal = signal as unknown as Signal<TContext, Schema<number>>;
  return {
    ...signal,
    greaterThan: (value: number) =>
      new SignalRule(operator.$gt, numberSignal, value),
    greaterThanOrEquals: (value: number) =>
      new SignalRule(operator.$gte, numberSignal, value),
    lessThan: (value: number) =>
      new SignalRule(operator.$lt, numberSignal, value),
    lessThanOrEquals: (value: number) =>
      new SignalRule(operator.$lte, numberSignal, value),
  };
}

function addStringOperators<TContext, TSchema extends Schema>(
  signal: Signal<TContext, TSchema>,
): Signal<TContext, TSchema> {
  const stringSignal = signal as unknown as Signal<TContext, Schema<string>>;
  return {
    ...signal,
    endsWith: (value: string) =>
      new SignalRule(operator.$sfx, stringSignal, value),
    includes: (value: string) =>
      new SignalRule(operator.$inc, stringSignal, value),
    matches: value => new SignalRule(operator.$rx, stringSignal, value),
    startsWith: (value: string) =>
      new SignalRule(operator.$pfx, stringSignal, value),
  };
}

function addModifiers<TContext, TSchema extends Schema>(
  signal: Signal<TContext, TSchema>,
): Signal<TContext, TSchema> {
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

export function type<TSchema extends Schema>(
  schema: TSchema,
): SignalFactory<TSchema> {
  return {
    _schema: schema,
    value<TContext>(
      fn: (context: TContext) => Infer<TSchema> | Promise<Infer<TSchema>>,
    ) {
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
