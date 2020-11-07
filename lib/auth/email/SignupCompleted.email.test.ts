import { User } from '@auth/models/User';
import { resetDatabase, testService } from '@libUtils/testUtils';
import { sendSignupCompletedEmail } from '@auth/email/SignupCompleted.email';
import { EMAIL_CONFIG } from '@email/services/validateEmailConfig';

describe('SignupCompleted Email', () => {
  let user: User;

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

      await sendSignupCompletedEmail({ user });

      expect(sendRawEmail).toHaveBeenCalledWith(expect.objectContaining({
        subject: EMAIL_CONFIG.signupCompleted.subject,
        to: 'user@email.com',
        from: process.env.RESET_PASSWORD_EMAIL_SENDER,
      }));
    });
  });
  describe('on error', () => {
    test('return error message', async () => {
      const sendRawEmail = jest.fn().mockImplementationOnce(() => Promise.reject({ code: 100, message: 'some_error' }));
      testService({
        Email: { sendRawEmail },
      });

      await expect(sendSignupCompletedEmail({ user })).rejects.toEqual({
        code: 100,
        message: 'some_error',
      });
    });
  });
});
