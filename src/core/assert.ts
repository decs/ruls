export function assertArray<T>(value: unknown): Array<T> {
  if (!Array.isArray(value)) {
    throw new Error('Expected an array, got: ' + value);
  }
  return value;
}

export function assertBoolean(value: unknown): boolean {
  if (typeof value !== 'boolean') {
    throw new Error('Expected a boolean, got: ' + value);
  }
  return value;
}

export function assertNumber(value: unknown): number {
  if (typeof value !== 'number') {
    throw new Error('Expected a number, got: ' + value);
  }
  return value;
}

export function assertString(value: unknown): string {
  if (typeof value !== 'string') {
    throw new 'Expected a string, got: ' + value);
  }
  return value;
}
