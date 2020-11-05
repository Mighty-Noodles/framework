import { AuthController } from '@auth/controllers/Auth.controller';
import { User } from '@auth/models/User';
import { expectCountChangedBy, resetDatabase, testService } from '@test/utils';
import { SignupConfirmationService } from '@auth/services/SignupConfirmation.service';
import { PasswordService } from '@auth/services/Password.service';

describe('AuthController', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe('signup', () => {
    let res, req, status, json;

    beforeEach(() => {
      testService({
        Email: { sendRawEmail: () => Promise.resolve() },
      });
    });

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


  describe('confirmSignup', () => {
    let token: string, user: User;

    beforeEach(async () => {
      await resetDatabase();
      user =await User.query().insertAndFetch({ email: 'a@a.com', first_name: 'a', last_name: 'b', hash: '123', confirmed: false });
      token = SignupConfirmationService.tokenGenerator(user);
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

    test('authenticates token', async () => {
      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = {
        params: { id: user.id },
        query: { token: 'INVALID' },
      };
      const res: any = { status };

      await AuthController.confirmSignup(req, res);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        code: 401,
        message: 'Token is invalid',
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

    test('when email is not present', async () => {
      const sendRawEmail = jest.fn();
      testService({
        Email: { sendRawEmail },
      });

      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = { body: { } };
      const res: any = { status };

      await AuthController.request_reset_password(req, res);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        message: 'An email with a password reset link was sent to your inbox',
      });
      expect(sendRawEmail).not.toHaveBeenCalled();
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

      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith({
        message: 'Error sending email',
      });
    });
  });

  describe('reset_password', () => {
    let user: User, token: string;
    const password = 'STRINGPASS@';

    beforeEach(async () => {
      await resetDatabase();
      user = await User.query().insertAndFetch({ email: 'a@a.com', first_name: 'a', last_name: 'b', hash: '123' });
      token = PasswordService.resetPasswordTokenGenerator(user);
    });

    test('updates user passsword', async() => {
      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = {
        params: { id: user.id },
        query: { token },
        body: { password, password_confirmation: password },
      };
      const res: any = { status };

      await AuthController.reset_password(req, res);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        item: user.toJson(),
      });
    });

    test('authenticates token', async () => {
      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = {
        params: { id: user.id },
        query: { token: 'invalid' },
        body: { password, password_confirmation: password },
      };
      const res: any = { status };

      await AuthController.reset_password(req, res);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        code: 401,
        message: 'Token is invalid',
      });
    });
  });


  describe('earlyAccessSignup', () => {
    let res, req, status, json;

    beforeEach(() => {
      testService({
        Email: { sendRawEmail: () => Promise.resolve() },
      });
    });

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
      await expectCountChangedBy(User, () => AuthController.earlyAccessSignup(req, res), 1);

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

      await expectCountChangedBy(User, () => AuthController.earlyAccessSignup(req, res), 1);

      expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching('early'));
      expect(sendRawEmail).toHaveBeenCalledWith(expect.stringMatching('access'));
    });
  });


  describe('earlyAccessConfirmSignup', () => {
    let token: string, user: User;

    beforeEach(async () => {
      await resetDatabase();
      user =await User.query().insertAndFetch({ email: 'a@a.com', first_name: 'a', last_name: 'b', hash: '123', confirmed: false });
      token = SignupConfirmationService.tokenGenerator(user);
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
        body: { password: 'STRONGPASS@', password_confirmation: 'STRONGPASS@' }
      };
      const res: any = { status };

      await AuthController.earlyAccessConfirmSignup(req, res);

      const joinedEmail = sendRawEmail.mock.calls[0].join('').replace(/[\r\n]/g, '');
      expect(joinedEmail).toMatch(`Welcome`);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        item: user.toJson(),
      });
    });

    test('authenticates token', async () => {
      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = {
        params: { id: user.id },
        query: { token: 'INVALID' },
      };
      const res: any = { status };

      await AuthController.earlyAccessConfirmSignup(req, res);

      expect(status).toHaveBeenCalledWith(401);
      expect(json).toHaveBeenCalledWith({
        code: 401,
        message: 'Token is invalid',
      });
    });
  });
});
