import { AuthController } from '../../src/controllers/Auth.controller';
import { User } from '../../src/models/User';
import { generateJwt } from '../constants';
import { expectCountChangedBy } from '../utils';

describe('AuthController', () => {
  let user;

  beforeEach(async () => {
    await User.query().delete();
    user = await User.query().insertAndFetch(
      { email: 'user@email.com', first_name: 'User', last_name: 'One', hash: '123' },
    )
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

    test.todo('sends confirmation email');

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
            'last_name',
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

  describe('signin', () => {
    test.skip('return user with token', async () => {
      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = {
        login: (user, opts, cb) => {},
      };
      const res: any = { status };

      await AuthController.signin(req, res);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({ item: {
        ...user.toJson(),
        token: generateJwt(user),
      }});
      expect(json.mock.calls[0][0].item.hash).not.toBeDefined();
    });

    describe('on error', () => {
      test.todo('return 401');
    });
  });
});
