import { User } from "@auth/models/User";
import { replaceUserParams } from "./replaceUserParams";

describe('replaceUserParams', () => {
  const user: User = {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@email.com',
  } as User;

  test('replaces FIRST_NAME', () => {
    const body = 'Your first name is {FIRST_NAME}! Hello {FIRST_NAME}';

    const result = replaceUserParams(body, user);
    expect(result).toEqual('Your first name is John! Hello John');
  });

  test('replaces LAST_NAME', () => {
    const body = 'Your last name is {LAST_NAME}! Hello {LAST_NAME}';

    const result = replaceUserParams(body, user);
    expect(result).toEqual('Your last name is Doe! Hello Doe');
  });

  test('replaces USER_EMAIL', () => {
    const body = 'Your email is {USER_EMAIL}! I sent an email to {USER_EMAIL}';

    const result = replaceUserParams(body, user);
    expect(result).toEqual('Your email is john@email.com! I sent an email to john@email.com');
  });
});
