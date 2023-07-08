<h1 align="center">📏 Ruls</h1>
<p align="center">Typesafe rules engine with JSON encoding</p>
<p align="center">
<a href="https://opensource.org/licenses/MIT" rel="nofollow"><img src="https://img.shields.io/github/license/decs/ruls" alt="License"></a>
<a href="https://www.npmjs.com/package/ruls" rel="nofollow"><img src="https://img.shields.io/npm/dw/ruls.svg" alt="NPM Downloads"></a>
</p>

## Features

- Intuitive interface
- JSON-encodable rules
- Compatible with all type validation libraries

## Setup

Install `ruls` with your package manager of choice:

<table>
  <tr>
    <th>npm</th>
    <td><code>npm install ruls</code></td>
  </tr>
  <tr>
    <th>Yarn</th>
    <td><code>yarn add ruls</code></td>
  </tr>
  <tr>
    <th>pnpm</th>
    <td><code>pnpm add ruls</code></td>
  </tr>
</table>

Once complete, you can import it with:

```ts
import {rule, signal} from 'ruls';
```

Also, bring your favorite validation library (e.g. [zod](https://zod.dev)):

```ts
import {z} from 'zod';
```

## Usage

```ts
type Context = {
  user: {
    age: number;
    isActive: boolean;
    username: string;
    hobbies: Array<string>;
  };
};

const signals = {
  age: signal.type(z.number()).value<Context>(({user}) => user.age),
  isActive: signal.type(z.boolean()).value<Context>(({user}) => user.isActive),
  username: signal.type(z.string()).value<Context>(({user}) => user.username),
  hobbies: signal
    .type(z.array(z.string()))
    .value<Context>(({user}) => user.hobbies),
};

const programmers = rule.every([
  signals.age.greaterThanOrEquals(18),
  signals.isActive.isTrue(),
  signals.username.startsWith('user'),
  signals.hobbies.contains('programming'),
]);

const isEligible = await programmers.evaluate({
  user: {
    age: 25,
    isActive: true,
    username: 'user123',
    hobbies: ['reading', 'programming', 'traveling'],
  },
});
```

## Context

The contextual data or state relevant for evaluating rules. It encapsulates the necessary information required by signals to make decisions and determine the outcome of rules.

#### Example

```ts
type Context = {
  user: {
    age: number;
    isActive: boolean;
    username: string;
    hobbies: Array<string>;
  };
};
```

## Signal

A specific piece of information used to make decisions and evaluate rules. It acts as a building block for defining conditions and comparisons in the rule expressions. Signals encapsulate the logic and operations associated with specific data types, allowing you to perform comparisons, apply operators, and define rules based on the values they represent.

#### Example

```ts
const signals = {
  age: signal.type(z.number()).value<Context>(({user}) => user.age),
  isActive: signal.type(z.boolean()).value<Context>(({user}) => user.isActive),
  username: signal.type(z.string()).value<Context>(({user}) => user.username),
  hobbies: signal
    .type(z.array(z.string()))
    .value<Context>(({user}) => user.hobbies),
};
```

These modifiers and operators apply to all signal types:

| Modifier | Description                 | Encoded        |
| -------- | --------------------------- | -------------- |
| `not`    | Inverts the operator result | `{$not: rule}` |

| Operator | Description                      | Encoded              |
| -------- | -------------------------------- | -------------------- |
| `equals` | Matches the exact value          | `{$eq: value}`       |
| `in`     | Matches if the value in the list | `{$in: [...values]}` |

### `string` type

| Operator     | Description                                        | Encoded         |
| ------------ | -------------------------------------------------- | --------------- |
| `includes`   | Matches if the string includes a specific value    | `{$inc: value}` |
| `startsWith` | Matches if the string starts with a specific value | `{$pfx: value}` |
| `endsWith`   | Matches if the string ends with a specific value   | `{$sfx: value}` |
| `matches`    | Matches the string using a regular expression      | `{$rx: regex}`  |

### `number` type

| Operator              | Description                                                        | Encoded         |
| --------------------- | ------------------------------------------------------------------ | --------------- |
| `lessThan`            | Matches if the number is less than a specific value                | `{$lt: value}`  |
| `lessThanOrEquals`    | Matches if the number is less than or equal to a specific value    | `{$lte: value}` |
| `greaterThan`         | Matches if the number is greater than a specific value             | `{$gt: value}`  |
| `greaterThanOrEquals` | Matches if the number is greater than or equal to a specific value | `{$gte: value}` |

### `boolean` type

| Operator  | Description                       | Encoded        |
| --------- | --------------------------------- | -------------- |
| `isTrue`  | Matches if the boolean is `true`  | `{$eq: true}`  |
| `isFalse` | Matches if the boolean is `false` | `{$eq: false}` |

### `Array` type

| Operator        | Description                                                   | Encoded               |
| --------------- | ------------------------------------------------------------- | --------------------- |
| `every`         | Matches if all of the array elements passes the rule          | `{$and: [rule]}`      |
| `some`          | Matches if at least one of the array elements passes the rule | `{$or: [rule]}`       |
| `contains`      | Matches if the array contains the specific value              | `{$all: [value]}`     |
| `containsEvery` | Matches if array contains all of the specific values          | `{$all: [...values]}` |
| `containsSome`  | Matches if array contains at least one of the specific values | `{$any: [...values]}` |

## Rule

Allows you to define complex conditions and criteria for decision-making. It consists of one or more signals, which can be combined using logical operators to create intricate structures.

#### Example

```ts
const programmers = rule.every([
  signals.age.greaterThanOrEquals(18),
  signals.isActive.isTrue(),
  signals.username.startsWith('user'),
  signals.hobbies.contains('programming'),
]);
```

### Combination

| Operator | Description                               | Encoded                     |
| -------- | ----------------------------------------- | --------------------------- |
| `every`  | Matches if all of the rules pass          | `{$and: [...rules]}`        |
| `some`   | Matches if at least one of the rules pass | `{$or: [...rules]}`         |
| `none`   | Matches if none of the rules pass         | `{$not: {$or: [...rules]}}` |

### Encoding

Rules can be encoded into objects and/or JSON. That makes it possible to store them on a database for runtime retrieval.

```ts
const check = rule.every([
  signals.sampleString.matches(/3$/g),
  signals.sampleArray.not.contains(246),
]);

// Encoding
const encodedCheck = check.encode(signals);
expect(encodedCheck).toEqual({
  $and: [{sampleString: {$rx: '/3$/g'}}, {$not: {sampleArray: {$all: [246]}}}],
});
expect(JSON.stringify(encodedCheck)).toEqual(
  '{"$and":[{"sampleString":{"$rx":"/3$/g"}},{"$not":{"sampleArray":{"$all":[246]}}}]}',
);

// Decoding
const parsedCheck = await rule.parse(encodedCheck, signals);
expect(parsedCheck.encode(signals)).toEqual(encodedCheck);
```
