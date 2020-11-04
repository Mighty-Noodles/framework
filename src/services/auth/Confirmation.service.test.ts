import { User } from '../../models/User';
import { resetDatabase, testService } from '../../../tests/utils';

import { ConfirmationService } from './Confirmation.service';

describe('ConfirmationService', () => {
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

        await ConfirmationService.sendSignupConfirmationEmail(user);

        const joinedEmail = sendRawEmail.mock.calls[0].join('')
          .replace(/[\r\n]/g, '')
          .replace(/=/g, '');

        const token = ConfirmationService.tokenGenerator(user);

        expect(joinedEmail).toMatch(`https://${process.env.DOMAIN}/api/v1/signup/${user.id}/confirm`);
        expect(joinedEmail).toMatch(token);
        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching('Subject: Please confirm your subscription'));
        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching('To: user@email.com'));
        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching(`From: ${process.env.RESET_PASSWORD_EMAIL_SENDER}`));
      });
    });

    describe('when user is confirmed', () => {
      afterAll(() => {
        user.confirmed = false;
      });

      test('rejects request with USER CONFIRMED status', async () => {
        user.confirmed = true;
        await expect(ConfirmationService.sendSignupConfirmationEmail(user)).rejects.toEqual({ message: 'User is already confirmed' });
      });
    });

    describe('on error', () => {
      test('return error message', async () => {
        const sendRawEmail = jest.fn().mockImplementationOnce(() => Promise.reject({ code: 100, message: 'Error' }));
        testService({
          Email: { sendRawEmail },
        });

        await expect(ConfirmationService.sendSignupConfirmationEmail(user)).rejects.toEqual({ code: 100, message: 'Error sending confirmation email', error: { code: 100, message: 'Error' }});
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

        await ConfirmationService.sendSubscriptionCompletedEmail(user);

        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching('Subject: Welcome'));
        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching('To: user@email.com'));
        expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching(`From: ${process.env.RESET_PASSWORD_EMAIL_SENDER}`));
      });
    });

    describe('when user is not confirmed', () => {
      afterAll(() => {
        user.confirmed = true;
      });

      test('rejects request with USER NOT CONFIRMED status', async () => {
        user.confirmed = false;
        await expect(ConfirmationService.sendSubscriptionCompletedEmail(user)).rejects.toEqual({ code: 400, message: 'User did not confirm subscription' });
      });
    });

    describe('on error', () => {
      test('return error message', async () => {
        const sendRawEmail = jest.fn().mockImplementationOnce(() => Promise.reject({ code: 100, message: 'Error' }));
        testService({
          Email: { sendRawEmail },
        });

        await expect(ConfirmationService.sendSubscriptionCompletedEmail(user)).rejects.toEqual({ code: 100, message: 'Error sending subscription completed email', error: { code: 100, message: 'Error' }});
      });
    });
  });
});
