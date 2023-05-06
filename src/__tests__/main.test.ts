import {describe, expect, test} from '@jest/globals';

import {rule} from '../rules';
import Rule from '../rules/rule';
import {signal} from '../signals';
import AnySignal from '../signals/any';
import ArraySignal from '../signals/array';
import BooleanSignal from '../signals/boolean';
import NumberSignal from '../signals/number';
import StringSignal from '../signals/string';

type Context = {
  id: number;
};

describe('ruls', () => {
  const signals = {
    sampleAny: signal.any<Context, {username: string}>(({id}) => ({
      username: `user${id}`,
    })),
    sampleArray: signal.array<Context, number>(({id}) => [id]),
    sampleBoolean: signal.boolean<Context>(({id}) => id > 0),
    sampleNumber: signal.number<Context>(({id}) => 2 * id),
    sampleString: signal.string<Context>(({id}) => `id=${id}`),
  };

  test('class', () => {
    expect(signals.sampleAny).toBeInstanceOf(AnySignal);
    expect(signals.sampleArray).toBeInstanceOf(ArraySignal);
    expect(signals.sampleBoolean).toBeInstanceOf(BooleanSignal);
    expect(signals.sampleNumber).toBeInstanceOf(NumberSignal);
    expect(signals.sampleString).toBeInstanceOf(StringSignal);
  });

  test('evaluate', () => {
    expect(signals.sampleAny.evaluate({id: 123})).toEqual({
      username: 'user123',
    });
    expect(signals.sampleArray.evaluate({id: 123})).toEqual([123]);
    expect(signals.sampleBoolean.evaluate({id: 123})).toEqual(true);
    expect(signals.sampleNumber.evaluate({id: 123})).toEqual(246);
    expect(signals.sampleString.evaluate({id: 123})).toEqual('id=123');
  });

  test('rules', () => {
    const check = rule.every([
      signals.sampleString.endsWith('3'),
      signals.sampleArray.not.includes(246),
    ]);
    expect(check).toBeInstanceOf(Rule);
    const encodedCheck = check.encode(signals);
    expect(encodedCheck).toEqual({
      $and: [{sampleString: {$sfx: '3'}}, {$not: {sampleArray: {$all: [246]}}}],
    });
    const parsedCheck = rule.parse(encodedCheck, signals);
    expect(parsedCheck.encode(signals)).toEqual(encodedCheck);
  });
});