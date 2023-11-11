```typescript
export const str: string = 'Hello, world';
export const num: number = 42;
export const big_int: bigint = 1n;
export const bool: boolean = true || false;
export const mySymbol: symbol = Symbol('mySymbol');
export const undef: undefined = undefined;
export const arr: number[] = [1, 2, 3];

export function greet(name: string): void {
  return console.log('Hello, ' + name.toUpperCase() + '!!');
}

export function printName(obj: { first: string; last?: string }): string {
  const { first, last = '' } = obj;
  return `${last}${first}`;
}

// should be `string` or `number`
export function printId(id: string | number) {
  if (typeof id === 'string') {
    // In this branch, id is of type 'string'
    console.log(id.toUpperCase());
  } else if (typeof id === 'number') {
    // Here, id is of type 'number'
    console.log(id);
  }
}
```
