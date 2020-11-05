import { User } from '../../../models/User';
import { resetDatabase, testService } from '../../../testUtils/utils';
import { sendEarlyAccessSignupConfirmationRequiredEmail } from './EarlyAccessSignupConfirmationRequired.email';

describe('PasswordReset Email', () => {
  let user: User;
  const token = 'MY_TOKEN';

  beforeAll(async () => {
    await resetDatabase();
    user = await User.query().insertAndFetch(
      { email: 'user@email.com', first_name: 'a', last_name: 'b' },
    )
  });

  describe('success', () => {
    test('sends email with password reset request link', async() => {
      const sendRawEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
      testService({
        Email: { sendRawEmail },
      });

      await sendEarlyAccessSignupConfirmationRequiredEmail({ user, token });

      const joinedEmail = sendRawEmail.mock.calls[0].join('')
        .replace(/=[\r\n]/g, '')
        .replace(/[\r\n]/g, '');

      expect(joinedEmail).toMatch(`https://${process.env.DOMAIN}/api/v1/early_access/${user.id}/confirm?token=`);
      expect(joinedEmail).toMatch('MY_TOKEN');
      expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching('Subject: Please confirm your subscription'));
      expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching('To: user@email.com'));
      expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching(`From: ${process.env.RESET_PASSWORD_EMAIL_SENDER}`));
    });
  });
  describe('on error', () => {
    test('return error message', async () => {
      const sendRawEmail = jest.fn().mockImplementationOnce(() => Promise.reject({ code: 100, message: 'some_error' }));
      testService({
        Email: { sendRawEmail },
      });

      await expect(sendEarlyAccessSignupConfirmationRequiredEmail({ user, token })).rejects.toEqual({
        code: 100,
        message: 'some_error',
        error: { code: 100, message: 'some_error' },
      });
    });
  });
});
