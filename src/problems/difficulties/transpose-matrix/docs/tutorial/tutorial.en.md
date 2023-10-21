```typescript
type GetAllArrayFirstElement<T> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? First extends readonly [infer E, ...infer _]
    ? [E, ...GetAllArrayFirstElement<Rest>]
    : GetAllArrayFirstElement<Rest>
  : [];

type RemoveAllArrayFirstElement<T> = T extends readonly [
  infer First,
  ...infer Rest,
]
  ? First extends readonly [infer _, ...infer FirstRest]
    ? [FirstRest, ...RemoveAllArrayFirstElement<Rest>]
    : RemoveAllArrayFirstElement<Rest>
  : [];

export type TransposeMatrix<T> = T extends readonly [infer First, ...infer _]
  ? First extends readonly [infer _, ...infer __]
    ? [
        GetAllArrayFirstElement<T>,
        ...TransposeMatrix<RemoveAllArrayFirstElement<T>>,
      ]
    : []
  : [];
```
