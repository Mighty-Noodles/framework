import bcrypt from 'bcrypt';

import { User } from '@auth/models/User';
import { resetDatabase, testService } from '@utils/testUtils';

import { PasswordService } from './Password.service';
import { EMAIL_CONFIG } from '@email/services/validateEmailConfig';

describe('PasswordService', () => {
  describe('reset', () => {
    let user: User;
    const password = 'STRONGPASS@';

    beforeAll(async () => {
      await resetDatabase();
      user = await User.query().insertAndFetch(
        { email: 'user@email.com', first_name: 'a', last_name: 'b', hash: 'hashedpass' },
      );
    });


    describe('success', () => {
      test('updates user password', async () => {
        await PasswordService.reset({ user, password, password_confirmation: password });

        const updatedUser = await User.query().findById(user.id);

        const valid = await bcrypt.compare(password, updatedUser.hash);
        expect(valid).toEqual(true);
      });

      test('returns user', async () => {
        delete process.env.RESET_PASSWORD_EXPIRATION;
        const updatedUser = await PasswordService.reset({ user, password, password_confirmation: password });

        const valid = await bcrypt.compare(password, updatedUser.hash);
        expect(valid).toEqual(true);
      });
    });

    describe('returns error', () => {
      test('when password is week', async () => {
        const password = '1234567';
        await expect(PasswordService.reset({ user, password, password_confirmation: password })).rejects.toEqual({
          code: 422,
          message: 'Password must contain at least 8 characters',
        });
      });

      test('when password_confirmation is invalid', async () => {
        await expect(PasswordService.reset({ user, password, password_confirmation: 'another' })).rejects.toEqual({
          code: 422,
          message: 'Password confirmation do not match',
        });
      });
    });
  });

  describe('sendPasswordResetEmail', () => {
    beforeAll(async () => {
      await resetDatabase();
      await User.query().insertAndFetch(
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

        await PasswordService.sendPasswordResetEmail({ email: 'user@email.com' });

        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching(`Subject: ${EMAIL_CONFIG.passwordReset.subject}`));
      });
    });

    describe('when user does not exist', () => {
      test('resolves empty', async () => {
        await expect(PasswordService.sendPasswordResetEmail({ email: 'WRONG' })).resolves.toBeUndefined();
      });
    });

    describe('on error', () => {
      test('return error message', async () => {
        const sendRawEmail = jest.fn().mockImplementationOnce(() => Promise.reject({ code: 100, message: 'some_error' }));
        testService({
          Email: { sendRawEmail },
        });

        await expect(PasswordService.sendPasswordResetEmail({ email: 'user@email.com' })).rejects.toEqual({ code: 100, message: 'some_error' });
      });
    });
  });
});
