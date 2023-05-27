export function assertArray<T>(value: unknown): Array<T> {
  if (!Array.isArray(value)) {
    throw new Error();
  }
  return value;
}

export function assertBoolean(value: unknown): boolean {
  if (typeof value !== 'boolean') {
    throw new Error();
  }
  return value;
}

export function assertNumber(value: unknown): number {
  if (typeof value !== 'number') {
    throw new Error();
  }
  return value;
}

export function assertString(value: unknown): string {
  if (typeof value !== 'string') {
    throw new Error();
  }
  return value;
}
