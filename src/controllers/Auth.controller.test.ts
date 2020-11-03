import { AuthController } from '../controllers/Auth.controller';
import { User } from '../models/User';
import { expectCountChangedBy, resetDatabase, testService } from '../../tests/utils';

describe('AuthController', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe('signup', () => {
    test('return new created user with token without hash', async () => {
      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = {
        body: {
          email: 'a@a.com',
          first_name: 'a',
          last_name: 'b',
          password: 'StR0NGP@SS!',
          password_confirmation: 'StR0NGP@SS!',
        },
      };
      const res: any = { status };

      await AuthController.signup(req, res);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({ item: {
          id: expect.any(Number),
          email: 'a@a.com',
          first_name: 'a',
          last_name: 'b',
        },
        token: expect.any(String),
      });
      expect(json.mock.calls[0][0].item.hash).not.toBeDefined();
    });

    describe('errors', () => {
      test('422 when missing params', async () => {
        const status = jest.fn();
        const json = jest.fn();
        status.mockReturnValueOnce({ json });

        const req: any = {
          body: {},
        };
        const res: any = { status };

        await expectCountChangedBy(User, () => AuthController.signup(req, res), 0);

        expect(status).toHaveBeenCalledWith(422);
        expect(json).toHaveBeenCalledWith({
          message: "Missing some props",
          missing_props: [
            'first_name',
            'email',
            'password',
            'password_confirmation',
          ],
        });
      });

      test('when email is already taken', async () => {
        await User.query().insert({ email: 'a@a.com', first_name: 'a', last_name: 'b', hash: '123' });

        const status = jest.fn();
        const json = jest.fn();
        status.mockReturnValueOnce({ json });

        const req: any = {
          body: {
            email: 'a@a.com', first_name: 'a', last_name: 'b', password: '12345678', password_confirmation: '12345678',
          },
        };
        const res: any = { status };

        await expectCountChangedBy(User, () => AuthController.signup(req, res), 0);

        expect(status).toHaveBeenCalledWith(422);
        expect(json).toHaveBeenCalledWith({
          message: 'Email is already taken',
        });
      });

      test('when password confirmation does not match', async () => {
        const status = jest.fn();
        const json = jest.fn();
        status.mockReturnValueOnce({ json });

        const req: any = {
          body: {
            email: 'a@a.com', first_name: 'a', last_name: 'b', password: '123456', password_confirmation: '1',
          },
        };
        const res: any = { status };

        await expectCountChangedBy(User, () => AuthController.signup(req, res), 0);

        expect(status).toHaveBeenCalledWith(422);
        expect(json).toHaveBeenCalledWith({
          message: 'Password confirmation does not match',
        });
      });

      test('when password is week', async () => {
        const status = jest.fn();
        const json = jest.fn();
        status.mockReturnValueOnce({ json });

        const req: any = {
          body: {
            email: 'a@a.com', first_name: 'a', last_name: 'b', password: '1234567', password_confirmation: '1234567',
          },
        };
        const res: any = { status };

        await expectCountChangedBy(User, () => AuthController.signup(req, res), 0);

        expect(status).toHaveBeenCalledWith(422);
        expect(json).toHaveBeenCalledWith({
          message: 'Password must be at least 8 characters long',
        });
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
