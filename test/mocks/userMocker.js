import bcrypt from "bcrypt";
import { faker } from "@faker-js/faker";

export const generateMockUsers = (count = 1) => {
  const users = [];
  for (let i = 1; i <= count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    const user = {
      first_name: firstName,
      last_name: lastName,
      email: faker.internet.email({
        firstName,
        lastName,
      }),
      age: faker.number.int({ min: 18, max: 80 }),
      password: bcrypt.hashSync(`password${i}`, 10),
      role: i % 2 === 0 ? "admin" : "user",
    };
    users.push(user);
  }
  return users;
};
