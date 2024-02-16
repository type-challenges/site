### **Intro**

Filtering requirements have grown. We need to be able to filter any kind of Persons.

### **Exercise**

Fix typing for the filterPersons so that it can filter users and return User[] when personType='user' and return Admin[] when personType='admin'. Also filterPersons should accept partial User/Admin type according to the personType.

`criteria` argument should behave according to the `personType` argument value.

`type` field is not allowed in the `criteria` field.

### **Higher difficulty bonus exercise**

Implement a function `getObjectKeys()` which returns more convenient result for any argument given, so that you don't need to cast it.

```typescript
let criteriaKeys = Object.keys(criteria) as (keyof User)[];
// -->
let criteriaKeys = getObjectKeys(criteria);
```

### **Reference**

> [https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads)
