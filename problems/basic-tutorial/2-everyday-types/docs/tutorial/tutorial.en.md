```typescript
export const str: string = 'Hello, world';
export const num: number = 42;
export const bool: boolean = true || false;
export const arr: number[] = [1];

export function greet(name: string): void {
  return console.log('Hello, ' + name.toUpperCase() + '!!');
}

export function printName(obj: { first: string; last?: string }): string {
  const { first, last = '' } = obj;
  return `${last}${first}`;
}

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
