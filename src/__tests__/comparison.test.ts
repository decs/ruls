import {describe, expect, test} from '@jest/globals';
import {z} from 'zod';

import {rule} from '../rules';
import {signal} from '../signals';

describe('json-rules-engine', () => {
  test('basic example', async () => {
    type Context = {
      gameDuration: number;
      personalFouls: number;
    };
    const signals = {
      gameDuration: signal
        .type(z.number())
        .value<Context>(({gameDuration}) => gameDuration),
      personalFouls: signal
        .type(z.number())
        .value<Context>(({personalFouls}) => personalFouls),
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
      company: signal.type(z.string()).value<Context>(({company}) => company),
      ptoDaysTaken: signal
        .type(z.array(z.string()))
        .value<Context>(({ptoDaysTaken}) => ptoDaysTaken),
      status: signal.type(z.string()).value<Context>(({status}) => status),
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
