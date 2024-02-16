import { assert, type Equal } from 'type-assertions';
import { User, Admin, Person, persons, logPerson } from './template';

assert<Equal<User['type'], 'user'>>();
assert<Equal<User['name'], string>>();
assert<Equal<User['age'], number>>();
assert<Equal<User['occupation'], string>>();
assert<Equal<Admin['type'], 'admin'>>();
assert<Equal<Admin['name'], string>>();
assert<Equal<Admin['age'], number>>();
assert<Equal<Admin['role'], string>>();
assert<Equal<Person, User | Admin>>();
assert<Equal<typeof persons, Person[]>>();
assert<Equal<Parameters<typeof logPerson>[0], Person>>();
