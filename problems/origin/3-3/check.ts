import { assert, type Equal } from 'type-assertions';
import type { User, Admin, Person } from './template';
import { persons, logPerson } from './template';

assert<Equal<User['name'], string>>();
assert<Equal<User['age'], number>>();
assert<Equal<User['occupation'], string>>();
assert<Equal<Admin['name'], string>>();
assert<Equal<Admin['age'], number>>();
assert<Equal<Admin['role'], string>>();
assert<Equal<Person, User | Admin>>();
assert<Equal<typeof persons, Person[]>>();
// @ts-ignore
assert<Equal<Parameters<typeof logPerson>[0], Person>>();
