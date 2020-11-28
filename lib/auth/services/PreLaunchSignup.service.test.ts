import { User } from '../models/User';
import { expectCountChangedBy, resetDatabase, testService } from '../../libUtils/testUtils';
import { PreLaunchSignupService } from './PreLaunchSignup.service';
import { EMAIL_CONFIG } from '../../email/services/validateEmailConfig';

describe('PreLaunchSignupService', () => {
  describe('signup', () => {
    beforeEach(async () => {
      await resetDatabase();
      testService({
        Email: { sendEmail: () => Promise.resolve() },
      });
    });

    describe('when new user', () => {
      const params = {
        email: 'a@a.com',
        first_name: 'a',
        last_name: 'b',
        metadata: { newsletter: true },
      };

      test('return new created user', async () => {
        const result = await expectCountChangedBy(User, () => PreLaunchSignupService.signup(params), 1);

        expect(result).toMatchObject({
            id: expect.any(Number),
            email: 'a@a.com',
            first_name: 'a',
            last_name: 'b',
        });
      });

      test('saves metadata', async () => {
        const result = await expectCountChangedBy(User, () => PreLaunchSignupService.signup(params), 1);

        const newUser = await User.query().findById(result.id);
        expect(newUser.metadata).toEqual({ newsletter: true });
      });

      test('sends confirmation email', async () => {
        const sendEmail = jest.fn().mockImplementation(() => Promise.resolve());
        testService({
          Email: { sendEmail },
        });

        await expectCountChangedBy(User, () => PreLaunchSignupService.signup(params), 1);
        expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: EMAIL_CONFIG.preLaunchSignup.subject }));
      });

      test('returns error when email delivery fails', async () => {
        const sendEmail = jest.fn().mockImplementation(() => Promise.reject({ code: 100, message: 'some_error' }));
        testService({
          Email: { sendEmail },
        });

        await expect(PreLaunchSignupService.signup(params)).rejects.toEqual({
          code: 100,
          message: 'some_error',
        });
      });
    });

    describe('errors', () => {
      test('422 when missing params', async () => {
        // @ts-ignore
        await expect(PreLaunchSignupService.signup({})).rejects.toEqual({
          code: 422,
          message: "Missing some props",
          missing_props: [
            'first_name',
            'email',
          ],
        });
      });

      describe('when email is already taken', () => {
        test('returns 422 when user is confirmed and do not save password', async () => {
          await User.query().insert({ email: 'a@a.com', first_name: 'a', last_name: 'b', confirmed: true });

          const params = {
            email: 'a@a.com', first_name: 'a', last_name: 'b',
          };

          await expect(
            expectCountChangedBy(User, () => PreLaunchSignupService.signup(params), 0)
          ).rejects.toEqual({
            code: 422,
            message: 'Email is already taken',
          });
        });
      });
    });
  });
});
