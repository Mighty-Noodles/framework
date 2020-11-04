import { User } from '../../models/User';
import { expectCountChangedBy, resetDatabase, testService } from '../../../tests/utils';
import { SignupService } from './Signup.service';

describe('SignupService', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe('signup', () => {
    beforeEach(() => {
      testService({
        Email: { sendRawEmail: () => Promise.resolve() },
      });
    });

    describe('when new user', () => {
      const params = {
        email: 'a@a.com',
        first_name: 'a',
        last_name: 'b',
        password: 'StR0NGP@SS!',
        password_confirmation: 'StR0NGP@SS!',
      };

      test('return new created user', async () => {
        const result = await expectCountChangedBy(User, () => SignupService.signup(params), 1);

        expect(result).toMatchObject({
            id: expect.any(Number),
            email: 'a@a.com',
            first_name: 'a',
            last_name: 'b',
        });
      });

      test('sends confirmation email', async () => {
        const sendRawEmail = jest.fn().mockImplementation(() => Promise.resolve());
        testService({
          Email: { sendRawEmail },
        });

        await expectCountChangedBy(User, () => SignupService.signup(params), 1);

        expect(sendRawEmail).toHaveBeenCalled();
      });

      test('returns error when email delivery fails', async () => {
        const sendRawEmail = jest.fn().mockImplementation(() => Promise.reject('some_error'));
        testService({
          Email: { sendRawEmail },
        });

        await expect(SignupService.signup(params)).rejects.toEqual({
          code: 500,
          message: 'Error sending confirmation email',
        });
      });
    });

    describe('errors', () => {
      test('422 when missing params', async () => {
        // @ts-ignore
        await expect(SignupService.signup({})).rejects.toEqual({
          code: 422,
          message: "Missing some props",
          missing_props: [
            'first_name',
            'email',
            'password',
            'password_confirmation',
          ],
        });
      });

      describe('when email is already taken', () => {
        test('returns 422 when user is confirmed', async () => {
          await User.query().insert({ email: 'a@a.com', first_name: 'a', last_name: 'b', hash: '123', confirmed: true });

          const params = {
            email: 'a@a.com', first_name: 'a', last_name: 'b', password: '12345678', password_confirmation: '12345678',
          };

          await expect(
            expectCountChangedBy(User, () => SignupService.signup(params), 0)
          ).rejects.toEqual({
            code: 422,
            message: 'Email is already taken',
          });
        });

        describe('when user is not confirmed', () => {
          let params;

          beforeEach(async () => {
            await resetDatabase();
            await User.query().insert({ email: 'a@a.com', first_name: 'a', last_name: 'b', hash: '123', confirmed: false });

            params = { email: 'a@a.com', first_name: 'new-a', last_name: 'new-b', password: '12345678', password_confirmation: '12345678' };
          });

          test('updates and return success', async () => {
            const result = await expectCountChangedBy(User, () => SignupService.signup(params), 0);

            expect(result).toMatchObject({
              id: expect.any(Number),
              email: 'a@a.com',
              first_name: 'new-a',
              last_name: 'new-b',
            });
          });

          test('sends confirmation email', async () => {
            const sendRawEmail = jest.fn().mockImplementation(() => Promise.resolve());
            testService({
              Email: { sendRawEmail },
            });

            await expectCountChangedBy(User, () => SignupService.signup(params), 0);

            expect(sendRawEmail).toHaveBeenCalled();
          });

          test('returns error when email delivery fails', async () => {
            const sendRawEmail = jest.fn().mockImplementation(() => Promise.reject('some_error'));
            testService({
              Email: { sendRawEmail },
            });

            await expect(
              expectCountChangedBy(User, () => SignupService.signup(params), 0)
            ).rejects.toEqual({
              code: 500,
              message: 'Error sending confirmation email',
            });
          });
        });
      });

      test('when password confirmation does not match', async () => {
        const params = { email: 'a@a.com', first_name: 'a', last_name: 'b', password: '123456', password_confirmation: '1' };

        await expect(
          expectCountChangedBy(User, () => SignupService.signup(params), 0)
        ).rejects.toEqual({
          code: 422,
          message: 'Password confirmation does not match',
        });
      });

      test('when password is week', async () => {
        const params = {
          email: 'a@a.com', first_name: 'a', last_name: 'b', password: '1234567', password_confirmation: '1234567',
        };

        await expect(
          expectCountChangedBy(User, () => SignupService.signup(params), 0)
        ).rejects.toEqual({
          code: 422,
          message: 'Password must be at least 8 characters long',
        });
      });
    });
  });
});
