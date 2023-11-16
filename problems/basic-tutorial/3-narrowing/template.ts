export function padLeft(padding: unknown, input: string) {
  if (typeof padding === 'number') {
    return ' '.repeat(padding) + input;
  } else if (typeof padding === 'string') {
    return padding + input;
  }
  return input;
}
