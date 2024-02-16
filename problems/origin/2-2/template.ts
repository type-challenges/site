export interface User {
  name: string;
  age: number;
  occupation: string;
}

export interface Admin {
  name: string;
  age: number;
  role: string;
}

export type Person = any;

export const persons: any[] /* <- Person[] */ = [
  {
    name: 'Max Mustermann',
    age: 25,
    occupation: 'Chimney sweep',
  },
  {
    name: 'Jane Doe',
    age: 32,
    role: 'Administrator',
  },
  {
    name: 'Kate Müller',
    age: 23,
    occupation: 'Astronaut',
  },
  {
    name: 'Bruce Willis',
    age: 64,
    role: 'World saver',
  },
];

export function logPerson(user: User) {
  console.log(` - ${user.name}, ${user.age}`);
}

persons.forEach(logPerson);
