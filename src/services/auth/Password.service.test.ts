import { User } from '../../models/User';
import { resetDatabase, testService } from '../../../tests/utils';

import { PasswordService } from './Password.service';

describe('PasswordService', () => {
  describe('Password Reset Request', () => {
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

        expect(joinedEmail).toMatch(`https://${process.env.DOMAIN}/password_reset`);
        expect(joinedEmail.replace(/=/g, '')).toMatch(token);
        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching('Subject: You forgot your password'));
        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching('To: user@email.com'));
        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching(`From: ${process.env.RESET_PASSWORD_EMAIL_SENDER}`));
      });
    });

    describe('when user does not exist', () => {
      test('rejects request with NOT_FOUND status', async () => {
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
