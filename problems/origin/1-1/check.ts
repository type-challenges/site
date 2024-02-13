import { assert, type Equal } from 'type-assertions';
import { type User, users, logPerson } from './template';

// @ts-ignore
assert<Equal<User['name'], string>>();
// @ts-ignore
assert<Equal<User['age'], number>>();
// @ts-ignore
assert<Equal<User['occupation'], string>>();
assert<Equal<typeof users, User[]>>();
assert<Equal<Parameters<typeof logPerson>[0], User>>();
