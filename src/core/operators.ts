import type Rule from '../rules/rule';

export type OperatorKey = keyof typeof operator;

export const operator = {
  $all<T>(first: Array<T>, second: Array<T>): boolean {
    return second.every(element => first.includes(element));
  },
  async $and<T>(first: Array<T>, second: Array<Rule<T>>): Promise<boolean> {
    const values = await Promise.all(
      first.flatMap(firstElement =>
        second.map(secondElement => secondElement.evaluate(firstElement)),
      ),
    );
    return values.every(Boolean);
  },
  $any<T>(first: Array<T>, second: Array<T>): boolean {
    return second.some(element => first.includes(element));
  },
  $eq<T>(first: T, second: T): boolean {
    return first === second;
  },
  $gt<T extends number>(first: T, second: T): boolean {
    return first > second;
  },
  $gte<T extends number>(first: T, second: T): boolean {
    return first >= second;
  },
  $in<T>(first: T, second: Array<T>): boolean {
    return second.includes(first);
  },
  $inc<T extends string>(first: T, second: T): boolean {
    return first.includes(second);
  },
  $lt<T extends number>(first: T, second: T): boolean {
    return first < second;
  },
  $lte<T extends number>(first: T, second: T): boolean {
    return first <= second;
  },
  $not<T extends boolean>(value: T): boolean {
    return !value;
  },
  async $or<T>(first: Array<T>, second: Array<Rule<T>>): Promise<boolean> {
    const values = await Promise.all(
      first.flatMap(firstElement =>
        second.map(secondElement => secondElement.evaluate(firstElement)),
      ),
    );
    return values.some(Boolean);
  },
  $pfx<T extends string>(first: T, second: T): boolean {
    return first.startsWith(second);
  },
  $rx<T extends string>(first: T, second: RegExp): boolean {
    return first.match(second) != null;
  },
  $sfx<T extends string>(first: T, second: T): boolean {
    return first.endsWith(second);
  },
};

export function getOperatorKey<TFirst, TSecond>(
  fn: (first: TFirst, second: TSecond) => boolean | Promise<boolean>,
): OperatorKey {
  const operatorKey = (Object.keys(operator) as Array<OperatorKey>).find(
    key => operator[key] === fn,
  );
  if (operatorKey == null) {
    throw new Error();
  }
  return operatorKey;
}
