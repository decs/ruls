export type OperatorKey = keyof typeof operator;

export const operator = {
  $and<T extends boolean>(values: Array<T>): boolean {
    return values.every(Boolean);
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
  $lt<T extends number>(first: T, second: T): boolean {
    return first < second;
  },
  $lte<T extends number>(first: T, second: T): boolean {
    return first <= second;
  },
  $not<T extends boolean>(value: T): boolean {
    return !value;
  },
  $or<T extends boolean>(values: Array<T>): boolean {
    return values.some(Boolean);
  },
};

export function getOperatorKey<TFirst, TSecond>(
  fn: (first: TFirst, second: TSecond) => boolean,
): OperatorKey {
  const operatorKey = (Object.keys(operator) as Array<OperatorKey>).find(
    key => operator[key] === fn,
  );
  if (operatorKey == null) {
    throw new Error();
  }
  return operatorKey;
}
