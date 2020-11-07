import { User } from '@auth/models/User';
import { expectCountChangedBy, resetDatabase, testService } from '@libUtils/testUtils';
import { EarlyAccessSignupService } from '@auth/services/EarlyAccessSignup.service';
import { EMAIL_CONFIG } from '@email/services/validateEmailConfig';

describe('EarlyAccessSignupService', () => {
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
      };

      test('return new created user', async () => {
        const result = await expectCountChangedBy(User, () => EarlyAccessSignupService.signup(params), 1);

        expect(result).toMatchObject({
            id: expect.any(Number),
            email: 'a@a.com',
            first_name: 'a',
            last_name: 'b',
        });
      });

      test('sends confirmation email', async () => {
        const sendEmail = jest.fn().mockImplementation(() => Promise.resolve());
        testService({
          Email: { sendEmail },
        });

        await expectCountChangedBy(User, () => EarlyAccessSignupService.signup(params), 1);
        expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: EMAIL_CONFIG.earlyAccessSignupConfirmationRequired.subject }));
      });

      test('returns error when email delivery fails', async () => {
        const sendEmail = jest.fn().mockImplementation(() => Promise.reject({ code: 100, message: 'some_error' }));
        testService({
          Email: { sendEmail },
        });

        await expect(EarlyAccessSignupService.signup(params)).rejects.toEqual({
          code: 100,
          message: 'some_error',
        });
      });
    });

    describe('errors', () => {
      test('422 when missing params', async () => {
        // @ts-ignore
        await expect(EarlyAccessSignupService.signup({})).rejects.toEqual({
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
            expectCountChangedBy(User, () => EarlyAccessSignupService.signup(params), 0)
          ).rejects.toEqual({
            code: 422,
            message: 'Email is already taken',
          });
        });

        describe('when user is not confirmed', () => {
          let params;

          beforeEach(async () => {
            await resetDatabase();
            await User.query().insert({ email: 'a@a.com', first_name: 'a', last_name: 'b', confirmed: false });

            params = { email: 'a@a.com', first_name: 'new-a', last_name: 'new-b' };
          });

          test('does not update and return success', async () => {
            const result = await expectCountChangedBy(User, () => EarlyAccessSignupService.signup(params), 0);

            expect(result).toMatchObject({
              id: expect.any(Number),
              email: 'a@a.com',
              first_name: 'a',
              last_name: 'b',
            });
          });

          test('sends confirmation email', async () => {
            const sendEmail = jest.fn().mockImplementation(() => Promise.resolve());
            testService({
              Email: { sendEmail },
            });

            await expectCountChangedBy(User, () => EarlyAccessSignupService.signup(params), 0);

            expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: EMAIL_CONFIG.earlyAccessSignupConfirmationRequired.subject }));
          });

          test('returns error when email delivery fails', async () => {
            const sendEmail = jest.fn().mockImplementation(() => Promise.reject({ code: 100, message: 'some_error' }));
            testService({
              Email: { sendEmail },
            });

            await expect(
              expectCountChangedBy(User, () => EarlyAccessSignupService.signup(params), 0)
            ).rejects.toEqual({
              code: 100,
              message: 'some_error',
            });
          });
        });
      });
    });
  });

  describe('confirmSignup', () => {
    let user: User;
    const password = 'STRONGPASS@';

    beforeEach(async () => {
      testService({
        Email: { sendEmail: () => Promise.resolve() },
      });

      await resetDatabase();
      user = await User.query().insertAndFetch({ email: 'user@email.com', first_name: 'a', last_name: 'b', confirmed: false });
    });

    describe('success', () => {
      test('returns user as JSON', async () => {
        const result = await EarlyAccessSignupService.confirmSignup({ user, password, password_confirmation: password });

        const updatedUser = await User.query().findById(user.id);
        expect(result).toEqual(updatedUser);
      });

      test('updates user confirm to true', async () => {
        expect(user.confirmed).toBeFalsy();

        await EarlyAccessSignupService.confirmSignup({ user, password, password_confirmation: password });

        const updatedUser = await User.query().findById(user.id);
        expect(updatedUser.confirmed).toBeTruthy();
      });

      test('sends subscription completed email', async () => {
        const sendEmail = jest.fn().mockReturnValueOnce(Promise.resolve());

        testService({
          Email: { sendEmail },
        });

        await EarlyAccessSignupService.confirmSignup({ user, password, password_confirmation: password });

        expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: EMAIL_CONFIG.signupCompleted.subject }));
      });
    });

    describe('when password is invalid', () => {
      test('returns 422 error when password is missing', async () => {
        await expect(
          EarlyAccessSignupService.confirmSignup({ user })
        ).rejects.toEqual({
          code: 422,
          message: 'Password must contain at least 8 characters',
        });
      });

      test('returns 422 error when password is weak', async () => {
        await expect(
          EarlyAccessSignupService.confirmSignup({ user, password: '1234567', password_confirmation: '1234567' })
        ).rejects.toEqual({
          code: 422,
          message: 'Password must contain at least 8 characters',
        });
      });

      test('returns 422 error when password_confirmation does not match', async () => {
        await expect(
          EarlyAccessSignupService.confirmSignup({ user, password, password_confirmation: 'NO_MATCH' })
        ).rejects.toEqual({
          code: 422,
          message: 'Password confirmation do not match',
        });
      });

      test('does not send email', async () => {
        const sendEmail = jest.fn();
        const sendEmail = jest.fn();

        testService({
          Email: { sendEmail, sendEmail },
        });

        await expect(EarlyAccessSignupService.confirmSignup({ user })).rejects.toEqual({
          code: 422,
          message: 'Password must contain at least 8 characters',
        });

        expect(sendEmail).not.toHaveBeenCalled();
        expect(sendEmail).not.toHaveBeenCalled();
      });
    });

    describe('when user is already confirmed', () => {
      beforeEach(async () => {
        user = await user.$query().updateAndFetch({ confirmed: true, hash: '123' });
      });

      test('returns user without saving password', async () => {
        const result = await EarlyAccessSignupService.confirmSignup({ user, password, password_confirmation: password });

        const updatedUser = await User.query().findById(user.id);
        expect(result).toEqual(updatedUser);
        expect(updatedUser.hash).toEqual('123');
      });

      test('does not send email', async () => {
        const sendEmail = jest.fn();
        const sendEmail = jest.fn();

        testService({
          Email: { sendEmail, sendEmail },
        });

        await EarlyAccessSignupService.confirmSignup({ user, password, password_confirmation: password });

        expect(sendEmail).not.toHaveBeenCalled();
        expect(sendEmail).not.toHaveBeenCalled();
      });
    });
  });
});
