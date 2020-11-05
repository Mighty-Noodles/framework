import { User } from '@auth/models/User';
import { resetDatabase, testService } from '@utils/testUtils';

import { SignupConfirmationService } from '@auth/services/SignupConfirmation.service';
import { EMAIL_CONFIG } from '@email/services/validateEmailConfig';

describe('SignupConfirmationService', () => {
  describe('sendSignupConfirmationEmail', () => {
    let user: User;

    beforeAll(async () => {
      await resetDatabase();
      user = await User.query().insertAndFetch(
        { email: 'user@email.com', first_name: 'a', last_name: 'b', hash: 'hashedpass' },
      )
    });

    describe('success', () => {
      test('sends email with password reset request link', async() => {
        const sendRawEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
        testService({
          Email: { sendRawEmail },
        });

        await SignupConfirmationService.sendSignupConfirmationEmail(user);

        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching(`Subject: ${EMAIL_CONFIG.signupConfirmationRequired.subject}`));
      });
    });

    describe('when user is confirmed', () => {
      afterAll(() => {
        user.confirmed = false;
      });

      test('rejects request with USER CONFIRMED status', async () => {
        user.confirmed = true;
        await expect(SignupConfirmationService.sendSignupConfirmationEmail(user)).rejects.toEqual({ message: 'User is already confirmed' });
      });
    });

    describe('on error', () => {
      test('return error message', async () => {
        const sendRawEmail = jest.fn().mockImplementationOnce(() => Promise.reject({ code: 100, message: 'some_error' }));
        testService({
          Email: { sendRawEmail },
        });

        await expect(SignupConfirmationService.sendSignupConfirmationEmail(user)).rejects.toEqual({ code: 100, message: 'some_error' });
      });
    });
  });

  describe('sendSubscriptionCompletedEmail', () => {
    let user: User;

    beforeAll(async () => {
      await resetDatabase();
      user = await User.query().insertAndFetch(
        { email: 'user@email.com', first_name: 'a', last_name: 'b', hash: 'hashedpass', confirmed: true },
      )
    });

    describe('success', () => {
      test('sends email', async() => {
        const sendRawEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
        testService({
          Email: { sendRawEmail },
        });

        await SignupConfirmationService.sendSubscriptionCompletedEmail(user);

        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching(`Subject: ${EMAIL_CONFIG.signupCompleted.subject}`));
      });
    });

    describe('when user is not confirmed', () => {
      afterAll(() => {
        user.confirmed = true;
      });

      test('rejects request with USER NOT CONFIRMED status', async () => {
        user.confirmed = false;
        await expect(SignupConfirmationService.sendSubscriptionCompletedEmail(user)).rejects.toEqual({ code: 400, message: 'User did not confirm subscription' });
      });
    });

    describe('on error', () => {
      test('return error message', async () => {
        const sendRawEmail = jest.fn().mockImplementationOnce(() => Promise.reject({ code: 100, message: 'some_error' }));
        testService({
          Email: { sendRawEmail },
        });

        await expect(SignupConfirmationService.sendSubscriptionCompletedEmail(user)).rejects.toEqual({ code: 100, message: 'some_error' });
      });
    });
  });

  describe('sendEarlyAccessSignupConfirmationEmail', () => {
    let user: User;

    beforeAll(async () => {
      await resetDatabase();
      user = await User.query().insertAndFetch(
        { email: 'user@email.com', first_name: 'a', last_name: 'b', hash: 'hashedpass' },
      )
    });

    describe('success', () => {
      test('sends email with password reset request link', async() => {
        const sendRawEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
        testService({
          Email: { sendRawEmail },
        });

        await SignupConfirmationService.sendEarlyAccessSignupConfirmationEmail(user);

        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching(EMAIL_CONFIG.earlyAccessSignupConfirmationRequired.action_url.replace(/{USER_ID}/g, String(user.id))));
      });
    });

    describe('when user is confirmed', () => {
      afterAll(() => {
        user.confirmed = false;
      });

      test('rejects request with USER CONFIRMED status', async () => {
        user.confirmed = true;
        await expect(SignupConfirmationService.sendEarlyAccessSignupConfirmationEmail(user)).rejects.toEqual({ message: 'User is already confirmed' });
      });
    });

    describe('on error', () => {
      test('return error message', async () => {
        const sendRawEmail = jest.fn().mockImplementationOnce(() => Promise.reject({ code: 100, message: 'some_error' }));
        testService({
          Email: { sendRawEmail },
        });

        await expect(SignupConfirmationService.sendEarlyAccessSignupConfirmationEmail(user)).rejects.toEqual({ code: 100, message: 'some_error' });
      });
    });
  });
});
