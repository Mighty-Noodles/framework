import { User } from '../models/User';
import { resetDatabase, testService } from '../../libUtils/testUtils';
import { sendSignupCompletedEmail } from '../email/SignupCompleted.email';
import { EMAIL_CONFIG } from '../../email/services/validateEmailConfig';

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
      const sendEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
      testService({
        Email: { sendEmail },
      });

      await sendSignupCompletedEmail({ user });

      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({
        subject: EMAIL_CONFIG.signupCompleted.subject,
        to: 'user@email.com',
        from: process.env.SIGNUP_EMAIL_SENDER,
      }));
    });
  });
  describe('on error', () => {
    test('return error message', async () => {
      const sendEmail = jest.fn().mockImplementationOnce(() => Promise.reject({ code: 100, message: 'some_error' }));
      testService({
        Email: { sendEmail },
      });

      await expect(sendSignupCompletedEmail({ user })).rejects.toEqual({
        code: 100,
        message: 'some_error',
      });
    });
  });
});
