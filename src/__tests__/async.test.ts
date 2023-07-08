import {describe, expect, test} from '@jest/globals';
import {z} from 'zod';

import {signal} from '../signals';

type Record = {
  name: string;
};
type Context = {
  id: number;
};

async function fetchRecord(id: number): Promise<Record> {
  return {name: `record_${id}`};
}

describe('ruls', () => {
  const signals = {
    name: signal
      .type(z.string())
      .value<Context>(async ({id}) => (await fetchRecord(id)).name),
  };

  test('evaluate', async () => {
    expect(await signals.name.evaluate({id: 123})).toEqual('record_123');
    expect(await signals.name.evaluate({id: 246})).toEqual('record_246');
  });
});
