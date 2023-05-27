import {describe, expect, test} from '@jest/globals';

import {rule} from '../rules';
import {signal} from '../signals';

describe('json-rules-engine', () => {
  test('basic example', async () => {
    type Context = {
      gameDuration: number;
      personalFouls: number;
    };
    const signals = {
      gameDuration: signal.number<Context>(({gameDuration}) => gameDuration),
      personalFouls: signal.number<Context>(({personalFouls}) => personalFouls),
    };
    const fouledOut = rule.some([
      rule.every([
        signals.gameDuration.equals(40),
        signals.personalFouls.greaterThanOrEquals(5),
      ]),
      rule.every([
        signals.gameDuration.equals(48),
        signals.personalFouls.greaterThanOrEquals(6),
      ]),
    ]);
    expect(
      await fouledOut.evaluate({gameDuration: 40, personalFouls: 6}),
    ).toBeTruthy();
    expect(
      await fouledOut.evaluate({gameDuration: 48, personalFouls: 5}),
    ).toBeFalsy();
  });

  test('advanced example', async () => {
    type Context = {
      company: string;
      status: string;
      ptoDaysTaken: Array<string>;
    };
    const signals = {
      company: signal.string<Context>(({company}) => company),
      ptoDaysTaken: signal.array<Context, string>(
        ({ptoDaysTaken}) => ptoDaysTaken,
      ),
      status: signal.string<Context>(({status}) => status),
    };
    const microsoftEmployeeOutOnChristmas = rule.every([
      signals.company.equals('microsoft'),
      signals.status.in(['active', 'paid-leave']),
      signals.ptoDaysTaken.contains('2016-12-25'),
    ]);
    const accountInformation = {
      company: 'microsoft',
      ptoDaysTaken: ['2016-12-24', '2016-12-25'],
      status: 'active',
    };
    expect(
      await microsoftEmployeeOutOnChristmas.evaluate(accountInformation),
    ).toBeTruthy();
    accountInformation.company = 'apple';
    expect(
      await microsoftEmployeeOutOnChristmas.evaluate(accountInformation),
    ).toBeFalsy();
  });
});
