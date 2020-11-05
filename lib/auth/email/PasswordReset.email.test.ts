import { User } from '@auth/models/User';
import { resetDatabase, testService } from '@test/utils';
import { sendPasswordResetEmail } from '@auth/email/PasswordReset.email';
import { EMAIL_CONFIG } from '@email/services/validateEmailConfig';

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

      await sendPasswordResetEmail({ user, token });

      expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching('MY_TOKEN'));
      expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching(EMAIL_CONFIG.passwordReset.action_url.replace(/{USER_ID}/g, user.id)));
      expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching(`Subject: ${EMAIL_CONFIG.passwordReset.subject}`));
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

      await expect(sendPasswordResetEmail({ user, token })).rejects.toEqual({
        code: 100,
        message: 'some_error',
        error: { code: 100, message: 'some_error' },
      });
    });
  });
});
