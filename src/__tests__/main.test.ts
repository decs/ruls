import {describe, expect, test} from '@jest/globals';

import {rule} from '../rules';
import Rule from '../rules/rule';
import {signal} from '../signals';

type Context = {
  id: number;
};

describe('ruls', () => {
  const signals = {
    sampleArray: signal.array(signal.number).value<Context>(({id}) => [id]),
    sampleBoolean: signal.boolean.value<Context>(({id}) => id > 0),
    sampleNumber: signal.number.value<Context>(({id}) => 2 * id),
    sampleString: signal.string.value<Context>(({id}) => `id=${id}`),
  };

  test('evaluate', async () => {
    expect(await signals.sampleArray.evaluate({id: 123})).toEqual([123]);
    expect(await signals.sampleBoolean.evaluate({id: 123})).toEqual(true);
    expect(await signals.sampleNumber.evaluate({id: 123})).toEqual(246);
    expect(await signals.sampleString.evaluate({id: 123})).toEqual('id=123');
  });

  test('rules', () => {
    const check = rule.every([
      signals.sampleString.matches(/3$/g),
      signals.sampleArray.not.contains(246),
    ]);
    expect(check).toBeInstanceOf(Rule);
    const encodedCheck = check.encode(signals);
    expect(encodedCheck).toEqual({
      $and: [
        {sampleString: {$rx: '/3$/g'}},
        {$not: {sampleArray: {$all: [246]}}},
      ],
    });
    expect(JSON.stringify(encodedCheck)).toEqual(
      '{"$and":[{"sampleString":{"$rx":"/3$/g"}},{"$not":{"sampleArray":{"$all":[246]}}}]}',
    );
    const parsedCheck = rule.parse(encodedCheck, signals);
    expect(parsedCheck.encode(signals)).toEqual(encodedCheck);
  });
});
