import { AuthController } from '../controllers/Auth.controller';
import { User } from '../models/User';
import { expectCountChangedBy, resetDatabase, testService } from '../../tests/utils';
import { ConfirmationService } from '../services/auth/Confirmation.service';

describe('AuthController', () => {
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
      let res, req, status, json;

      beforeEach(() => {
        json = jest.fn();
        status = jest.fn().mockReturnValueOnce({ json });

        req = {
          body: {
            email: 'a@a.com',
            first_name: 'a',
            last_name: 'b',
            password: 'StR0NGP@SS!',
            password_confirmation: 'StR0NGP@SS!',
          },
        };
        res = { status };
      });

      test('return new created user without hash', async () => {
        await expectCountChangedBy(User, () => AuthController.signup(req, res), 1);

        expect(status).toHaveBeenCalledWith(200);
        expect(json).toHaveBeenCalledWith({
          item: {
            id: expect.any(Number),
            email: 'a@a.com',
            first_name: 'a',
            last_name: 'b',
          },
        });
        expect(json.mock.calls[0][0].item.hash).not.toBeDefined();
      });

      test('sends confirmation email', async () => {
        const sendRawEmail = jest.fn().mockImplementation(() => Promise.resolve());
        testService({
          Email: { sendRawEmail },
        });

        await expectCountChangedBy(User, () => AuthController.signup(req, res), 1);

        expect(sendRawEmail).toHaveBeenCalled();
      });
    });
  });


  describe('confirmSignup', () => {
    let token: string, user: User;

    beforeEach(async () => {
      await resetDatabase();
      user =await User.query().insertAndFetch({ email: 'a@a.com', first_name: 'a', last_name: 'b', hash: '123', confirmed: false });
      token = ConfirmationService.tokenGenerator(user);
    });

    test('sends email with password reset request link', async() => {
      const sendRawEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
      testService({
        Email: { sendRawEmail },
      });

      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = {
        params: { id: user.id },
        query: { token },
      };
      const res: any = { status };

      await AuthController.confirmSignup(req, res);

      const joinedEmail = sendRawEmail.mock.calls[0].join('').replace(/[\r\n]/g, '');
      expect(joinedEmail).toMatch(`Welcome`);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        item: user.toJson(),
      });
    });

    test('on error returns message', async () => {
      const sendRawEmail = jest.fn().mockImplementation(() => Promise.reject({ code: 100, message: 'FAKE' }));
      testService({
        Email: { sendRawEmail },
      });

      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = {
        params: { id: user.id },
        query: { token },
      };
      const res: any = { status };

      await AuthController.confirmSignup(req, res);

      expect(status).toHaveBeenCalledWith(100);
      expect(json).toHaveBeenCalledWith({
        code: 100,
        message: 'Error sending subscription completed email',
      });
    });
  });

  describe('request_reset_password', () => {
    beforeEach(async () => {
      await resetDatabase();
      await User.query().insert({ email: 'a@a.com', first_name: 'a', last_name: 'b', hash: '123' });
    });

    test('sends email with password reset request link', async() => {
      const sendRawEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
      testService({
        Email: { sendRawEmail },
      });

      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = { body: { email: 'a@a.com' } };
      const res: any = { status };

      await AuthController.request_reset_password(req, res);

      const joinedEmail = sendRawEmail.mock.calls[0].join('').replace(/[\r\n]/g, '');
      expect(joinedEmail).toMatch(`https://${process.env.DOMAIN}/password_reset`);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        message: 'An email with a password reset link was sent to your inbox',
      });
    });

    test('on error returns message', async () => {
      const sendRawEmail = jest.fn().mockImplementation(() => Promise.reject());
      testService({
        Email: { sendRawEmail },
      });

      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = { body: { email: 'a@a.com' } };
      const res: any = { status };

      await AuthController.request_reset_password(req, res);

      const joinedEmail = sendRawEmail.mock.calls[0].join('').replace(/[\r\n]/g, '');
      expect(joinedEmail).toMatch(`https://${process.env.DOMAIN}/password_reset`);

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({
        message: 'Error request reset password',
      });
    });
  });
});
