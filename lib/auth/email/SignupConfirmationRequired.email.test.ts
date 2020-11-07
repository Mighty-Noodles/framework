import { User } from '@auth/models/User';
import { resetDatabase, testService } from '@libUtils/testUtils';
import { sendSignupConfirmationRequiredEmail } from '@auth/email/SignupConfirmationRequired.email';
import { EMAIL_CONFIG } from '@email/services/validateEmailConfig';

describe('SignupConfirmationRequired Email', () => {
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

      await sendSignupConfirmationRequiredEmail({ user, token });

      expect(sendRawEmail).toHaveBeenCalledWith(expect.objectContaining({
        html: expect.stringMatching(EMAIL_CONFIG.signupConfirmationRequired.action_url
            .replace(/{USER_ID}/g, String(user.id))
            .replace(/{DOMAIN}/g, process.env.EMAIL_DOMAIN)
            .replace(/{TOKEN}/g, 'MY_TOKEN')
            .replace('?', '\\?')),
        subject: EMAIL_CONFIG.signupConfirmationRequired.subject,
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

      await expect(sendSignupConfirmationRequiredEmail({ user, token })).rejects.toEqual({
        code: 100,
        message: 'some_error',
      });
    });
  });
});
