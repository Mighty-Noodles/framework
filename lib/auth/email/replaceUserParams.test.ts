import { User } from "@auth/models/User";
import { replaceUserParams } from "./replaceUserParams";

describe('replaceUserParams', () => {
  const user: User = {
    id: 123,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@email.com',
  } as User;

  test('replaces USER_ID', () => {
    const body = 'Your id is {USER_ID}! Hello {USER_ID}';

    const result = replaceUserParams(body, user);
    expect(result).toEqual('Your id is 123! Hello 123');
  });

  test('replaces USER_FIRST_NAME', () => {
    const body = 'Your first name is {USER_FIRST_NAME}! Hello {USER_FIRST_NAME}';

    const result = replaceUserParams(body, user);
    expect(result).toEqual('Your first name is John! Hello John');
  });

  test('replaces USER_LAST_NAME', () => {
    const body = 'Your last name is {USER_LAST_NAME}! Hello {USER_LAST_NAME}';

    const result = replaceUserParams(body, user);
    expect(result).toEqual('Your last name is Doe! Hello Doe');
  });

  test('replaces USER_EMAIL', () => {
    const body = 'Your email is {USER_EMAIL}! I sent an email to {USER_EMAIL}';

    const result = replaceUserParams(body, user);
    expect(result).toEqual('Your email is john@email.com! I sent an email to john@email.com');
  });
});
