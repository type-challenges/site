import { assert, type Equal } from 'type-assertions';
import type { HelloWorld } from './template';

// @ts-ignore
assert<Equal<HelloWorld, 'Hello, world'>>();
