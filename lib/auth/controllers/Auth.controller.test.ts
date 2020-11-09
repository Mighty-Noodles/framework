import { AuthController } from '../controllers/Auth.controller';
import { User } from '../models/User';
import { expectCountChangedBy, resetDatabase, testService } from '../../libUtils/testUtils';
import { SignupConfirmationService } from '../services/SignupConfirmation.service';
import { PasswordService } from '../services/Password.service';

import { EMAIL_CONFIG } from '../../email/services/validateEmailConfig';
import AppConfig from '../../../app.config.json';

describe('AuthController', () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  describe('signup', () => {
    let res, req, status, json;

    beforeEach(() => {
      testService({
        Email: { sendEmail: () => Promise.resolve() },
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
      const sendEmail = jest.fn().mockImplementation(() => Promise.resolve());
      testService({
        Email: { sendEmail },
      });

      await expectCountChangedBy(User, () => AuthController.signup(req, res), 1);

      expect(sendEmail).toHaveBeenCalled();
    });
  });


  describe('confirmSignup', () => {
    let token: string, user: User, req, res, status, json;

    beforeEach(async () => {
      await resetDatabase();
      user =await User.query().insertAndFetch({ email: 'a@a.com', first_name: 'a', last_name: 'b', hash: '123', confirmed: false });
      token = SignupConfirmationService.tokenGenerator(user);

      json = jest.fn();
      status = jest.fn().mockReturnValueOnce({ json });

      req = {
        accepts: () => 'json',
        params: { id: user.id },
        query: { token },
      };

      res = { status };
    });

    describe('format', () => {
      test('html', async () => {
        const redirect = jest.fn();
        const res: any = { redirect };

        req.accepts = () => 'html';

        await AuthController.confirmSignup(req, res);

        expect(redirect).toHaveBeenCalledWith(AppConfig.auth.signup.signupConfirmationRedirectUrl);
      });

      test('json', async () => {
        req.accepts = () => 'json';

        await AuthController.confirmSignup(req, res);

        expect(json).toHaveBeenCalledWith({ item: user.toJson() });
      });
    });

    test('accepts token in query or body', async() => {
      status = jest.fn().mockReturnValue({ json });
      req = {
        accepts: () => 'json',
        params: { id: user.id },
        query: { token },
      };
      res.status = status;

      await AuthController.confirmSignup(req, res);

      req = {
        accepts: () => 'json',
        params: { id: user.id },
        body: { token },
      };

      await AuthController.confirmSignup(req, res);

      expect(status).toHaveBeenNthCalledWith(1, 200);
      expect(status).toHaveBeenNthCalledWith(2, 200);
    });

    test('sends email with confirmation link', async() => {
      const sendEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
      testService({
        Email: { sendEmail },
      });

      await AuthController.confirmSignup(req, res);

      expect(sendEmail).toHaveBeenCalled();
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
      const sendEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
      testService({
        Email: { sendEmail },
      });

      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = { body: { email: 'a@a.com' } };
      const res: any = { status };

      await AuthController.request_reset_password(req, res);

      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: EMAIL_CONFIG.passwordReset.subject }));

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({
        message: 'An email with a password reset link was sent to your inbox',
      });
    });

    test('when email is not present', async () => {
      const sendEmail = jest.fn();
      testService({
        Email: { sendEmail },
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
      expect(sendEmail).not.toHaveBeenCalled();
    });

    test('on error returns message', async () => {
      const sendEmail = jest.fn().mockImplementation(() => Promise.reject({ code: 100, message: 'some_error' }));
      testService({
        Email: { sendEmail },
      });

      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = { body: { email: 'a@a.com' } };
      const res: any = { status };

      await AuthController.request_reset_password(req, res);

      expect(status).toHaveBeenCalledWith(100);
      expect(json).toHaveBeenCalledWith({
        code: 100,
        message: 'some_error',
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
        body: { token, password, password_confirmation: password },
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
        Email: { sendEmail: () => Promise.resolve() },
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
      const sendEmail = jest.fn().mockImplementation(() => Promise.resolve());
      testService({
        Email: { sendEmail },
      });

      await expectCountChangedBy(User, () => AuthController.earlyAccessSignup(req, res), 1);

      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: EMAIL_CONFIG.earlyAccessSignupConfirmationRequired.subject }));
    });
  });


  describe('earlyAccessConfirmSignup', () => {
    let token: string, user: User;

    beforeEach(async () => {
      await resetDatabase();
      user =await User.query().insertAndFetch({ email: 'a@a.com', first_name: 'a', last_name: 'b', hash: '123', confirmed: false });
      token = SignupConfirmationService.tokenGenerator(user);
    });

    test('sends email with confirmation link', async() => {
      const sendEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
      testService({
        Email: { sendEmail },
      });

      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = {
        params: { id: user.id },
        body: { token, password: 'STRONGPASS@', password_confirmation: 'STRONGPASS@' }
      };
      const res: any = { status };

      await AuthController.earlyAccessConfirmSignup(req, res);

      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ subject: EMAIL_CONFIG.signupCompleted.subject }));

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
        body: { token: 'INVALID' },
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
