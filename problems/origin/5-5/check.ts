import { assert, type Equal } from 'type-assertions';
import {
  User,
  Admin,
  Person,
  isAdmin,
  isUser,
  persons,
  logPerson,
  filterUsers,
} from './template';

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
assert<Equal<Parameters<typeof isUser>[0], Person>>();
assert<Equal<Parameters<typeof isAdmin>[0], Person>>();
assert<Equal<ReturnType<typeof isUser>, boolean>>();
assert<Equal<ReturnType<typeof isAdmin>, boolean>>();
assert<Equal<Parameters<typeof logPerson>[0], Person>>();
assert<Equal<Parameters<typeof filterUsers>[0], Person[]>>();
// @ts-ignore
assert<Equal<Parameters<typeof filterUsers>[1], Partial<Omit<User, 'type'>>>>();
assert<Equal<ReturnType<typeof filterUsers>, User[]>>();
