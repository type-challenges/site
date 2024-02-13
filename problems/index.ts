export * as Origin from './origin';
export * as BasicTutorial from './basic-tutorial';
export * as Difficulties from './difficulties';

// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable max-len */
// type Enumerate<N extends number, T extends number[] = []> = T['length'] extends N
//   ? T[number]
//   : Enumerate<N, [...T, T['length']]>;
// type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;
// type T = IntRange<100, 998>;
//
// type Zero = '0';
// type Range_1_9 = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';
// type Range_0_9 = Zero | Range_1_9;
// type Range_1_99 = `${Range_1_9}${Range_0_9}` | Range_1_9;
// type Range_1_999 = `${Range_1_9}${Range_0_9}${Range_0_9}` | Range_1_99;
// type Range_1_9999 = `${Range_1_9}${Range_0_9}${Range_0_9}${Range_0_9}` | Range_1_999;
// type Range_1_99999 = `${Range_1_9}${Range_0_9}${Range_0_9}${Range_0_9}${Range_0_9}` | Range_1_9999;
//
// type ArrayOfDefinedLength<L extends number, T extends readonly number[] = readonly []> = T['length'] extends L ? T : ArrayOfDefinedLength<L, [...T, T['length']]>;
// type DefinedZero<L extends number = 1, T extends readonly unknown[] = ArrayOfDefinedLength<L>> = T extends readonly [infer _, ...infer Rest] ? `${Zero}${DefinedZero<L, Rest>}` | DefinedZero<L, Rest> : T extends [infer _] ? Zero : '';
// type MyNumber<F extends number | string, L extends number> = Exclude<`${F}${Exclude<DefinedZero<L>, ''>}`, Zero>;
//
// const a: MyNumber<Exclude<Enumerate<10>, 0>, 10> = '10';
// const b: ArrayOfDefinedLength<5> = [0, 1, 2, 3, 4];
