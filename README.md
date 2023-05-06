<h1 align="center">Ruls</h1>
<p align="center">Typesafe rules engine</p>
<p align="center">
<a href="https://instagram.com/decs" rel="nofollow"><img src="https://img.shields.io/badge/created%20by-@decs-069.svg" alt="Created by André Costa"></a>
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/decs/ruls" alt="License"></a>
<a href="https://www.npmjs.com/package/zod" rel="nofollow"><img src="https://img.shields.io/npm/dw/ruls.svg" alt="NPM downloads"></a>
</p>
<br />

## Setup

### NPM

```sh
npm install ruls
```

### Yarn

```sh
yarn add ruls
```

## Usage

```ts
import {rule, signal} from 'ruls';

type Context = {
  id: number;
};

const signals = {
  sampleAny: signal.any<Context, {username: string}>(({id}) => ({
    username: `user${id}`,
  })),
  sampleArray: signal.array<Context, number>(({id}) => [id]),
  sampleBoolean: signal.boolean<Context>(({id}) => id > 0),
  sampleNumber: signal.number<Context>(({id}) => 2 * id),
  sampleString: signal.string<Context>(({id}) => `id=${id}`),
};

const check = rule.every([
  signals.sampleString.endsWith('3'),
  signals.sampleArray.not.includes(246),
]);

console.log(check.evaluate({id: 123})); // true
console.log(check.evaluate({id: 555})); // false
```
