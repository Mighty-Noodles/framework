import bcrypt from 'bcrypt';

import { User } from '../../models/User';
import { resetDatabase, testService } from '../../../tests/utils';

import { PasswordService } from './Password.service';

describe('PasswordService', () => {
  describe('reset', () => {
    let user: User, token: string;
    const password = 'STRONGPASS@';

    beforeAll(async () => {
      await resetDatabase();
      user = await User.query().insertAndFetch(
        { email: 'user@email.com', first_name: 'a', last_name: 'b', hash: 'hashedpass' },
      );
      token = PasswordService.resetPasswordTokenGenerator(user);
    });


    describe('success', () => {
      test('updates user password', async () => {
        await PasswordService.reset({ user, token, password, password_confirmation: password });

        const updatedUser = await User.query().findById(user.id);

        const valid = await bcrypt.compare(password, updatedUser.hash);
        expect(valid).toEqual(true);
      });

      test('returns user', async () => {
        delete process.env.RESET_PASSWORD_EXPIRATION;
        const updatedUser = await PasswordService.reset({ user, token, password, password_confirmation: password });

        const valid = await bcrypt.compare(password, updatedUser.hash);
        expect(valid).toEqual(true);
      });
    });

    describe('returns error', () => {
      test('when password is week', async () => {
        const password = '1234567';
        await expect(PasswordService.reset({ user, token, password, password_confirmation: password })).rejects.toEqual({
          code: 422,
          message: 'Password must contain at least 8 characters',
        });
      });

      test('when password_confirmation is invalid', async () => {
        await expect(PasswordService.reset({ user, token, password, password_confirmation: 'another' })).rejects.toEqual({
          code: 422,
          message: 'Password confirmation do not match',
        });
      });

      test('when token is invalid', async () => {
        const user2 = await User.query().insertAndFetch(
          { email: 'user2@email.com', first_name: 'a', last_name: 'b', hash: 'hashedpass' },
        );
        token = PasswordService.resetPasswordTokenGenerator(user2);

        await expect(PasswordService.reset({ user, token, password, password_confirmation: password })).rejects.toEqual({
          code: 401,
          message: 'Token is invalid',
        });
      });
    });
  });

  describe('requestReset', () => {
    let user;

    beforeAll(async () => {
      await resetDatabase();
      user = await User.query().insertAndFetch(
        { email: 'user@email.com', first_name: 'a', last_name: 'b', hash: 'hashedpass' },
      )
    });

    describe('success', () => {
      afterEach(() => {
        process.env.RESET_PASSWORD_EXPIRATION = '1d';
      });

      test('sends email with password reset request link', async() => {
        delete process.env.RESET_PASSWORD_EXPIRATION;

        const sendRawEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
        testService({
          Email: { sendRawEmail },
        });

        await PasswordService.requestReset({ email: 'user@email.com' });

        const joinedEmail = sendRawEmail.mock.calls[0].join('').replace(/[\r\n]/g, '');

        const token = PasswordService.resetPasswordTokenGenerator(user);

        expect(joinedEmail).toMatch(`https://${process.env.DOMAIN}/password_reset?token`);
        expect(joinedEmail.replace(/=/g, '')).toMatch(token);
        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching('Subject: You forgot your password'));
        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching('To: user@email.com'));
        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching(`From: ${process.env.RESET_PASSWORD_EMAIL_SENDER}`));
      });
    });

    describe('when user does not exist', () => {
      test('resolves empty', async () => {
        await expect(PasswordService.requestReset({ email: 'WRONG' })).resolves.toBeUndefined();
      });
    });

    describe('on error', () => {
      test('return error message', async () => {
        const sendRawEmail = jest.fn().mockImplementationOnce(() => Promise.reject('Error'));
        testService({
          Email: { sendRawEmail },
        });

        await expect(PasswordService.requestReset({ email: 'user@email.com' })).rejects.toEqual({ message: 'Error sending email', error: 'Error' });
      });
    });
  });
});
