import { assert, type Equal } from 'type-assertions';
import type { TransposeMatrix } from './template';

export type TestCases = [
  [[], []],
  [[[]], []],
  [[[[]]], [[[]]]],
  [[[1]], [[1]]],
  [[[1, 2]], [[1], [2]]],
  [[[1, 2], [], []], [[1], [2]]],
  [[[1, 2, 3]], [[1], [2], [3]]],
  [[[1, 2, 3], []], [[1], [2], [3]]],
  [[[1, 2], [3, 4], [5, 6]], [[1, 3, 5], [2, 4, 6]]],
  [[[1, 2], [3, 4, 9], [5, 6]], [[1, 3, 5], [2, 4, 6]]],
  [[[1, 2, 3], [4, 5, 6], [7, 8, 9]], [[1, 4, 7], [2, 5, 8], [3, 6, 9]]],
];

// @ts-ignore
assert<Equal<TransposeMatrix<TestCases[number][0]>, TestCases[number][1]>>();
