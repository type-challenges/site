export const str: unknown = 'Hello, world';
export const num: unknown = 42;
export const big_int: unknown = 1n;
export const bool: unknown = true || false;
export const mySymbol: unknown = Symbol('mySymbol');
export const undef: unknown = undefined;
export const arr: unknown = [1, 2, 3];

export function greet(name: any): unknown {
  return console.log('Hello, ' + name.toUpperCase() + '!!');
}

export function printName(obj: { first: unknown; last?: unknown }): unknown {
  const { first, last = '' } = obj;
  return `${last}${first}`;
}

// should be `string` or `number`
export function printId(id: unknown) {
  if (typeof id === 'string') {
    // In this branch, id is of type 'string'
    console.log(id.toUpperCase());
  } else if (typeof id === 'number') {
    // Here, id is of type 'number'
    console.log(id);
  }
}
