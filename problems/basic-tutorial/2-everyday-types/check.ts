import { assert, type Equal } from 'type-assertions';
import * as constant from './template';

// @ts-ignore
assert<Equal<typeof constant.str, string>>();
// @ts-ignore
assert<Equal<typeof constant.num, number>>();
// @ts-ignore
assert<Equal<typeof constant.bool, boolean>>();
// @ts-ignore
assert<Equal<typeof constant.arr, number[]>>();
// @ts-ignore
assert<Equal<Parameters<typeof constant.greet>[0], string>>();
// @ts-ignore
assert<Equal<ReturnType<typeof constant.greet>, void>>();
// @ts-ignore
assert<Equal<ReturnType<typeof constant.printName>, string>>();
// @ts-ignore
assert<Equal<Parameters<typeof constant.printId>[0], string | number>>();
