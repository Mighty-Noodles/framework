import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { server } from '@auth/test/server';
import { PASSWORD_HASH } from '@auth/test/constants';
import { countModel, resetDatabase, testService } from '@test/utils';

import { User } from '@auth/models/User';
import { SignupConfirmationService } from '@auth/services/SignupConfirmation.service';
import { PasswordService } from '@auth/services/Password.service';

describe('/auth route', () => {
  describe('POST /signup', () => {
    beforeEach(async () => {
      await resetDatabase();
    });

    test('creates and return user without hash', async (done) => {
      expect.hasAssertions();
      const initialCount = await countModel(User);

      const sendRawEmail = jest.fn().mockReturnValue(Promise.resolve())
      testService({
        Email: { sendRawEmail },
      });

      request(server)
        .post('/auth/signup')
        .send({ email: 'a@a.com', first_name: 'a', last_name: 'b', password: 'StR0NGP@SS!', password_confirmation: 'StR0NGP@SS!' })
        .expect(200)
        .end(async (err, res) => {
          const { body } = res;
          expect(body).toMatchObject({
            item: {
              id: expect.any(Number),
              email: 'a@a.com',
              first_name: 'a',
              last_name: 'b',
            },
          });
          expect(body.item.hash).not.toBeDefined();
          const finalCount = await countModel(User);

          expect(finalCount).toEqual(initialCount + 1);

          expect(sendRawEmail).toHaveBeenCalled();

          done(err);
        });
    });
  });

  describe('POST /signin', () => {
    let user: User;

    beforeAll(async () => {
      await resetDatabase();
      user = await User.query().insert(
        { email: 'a@a.com', first_name: 'a', last_name: 'b', confirmed: true, hash: PASSWORD_HASH },
      )
    });

    test('sign ins with correct credentials', async (done) => {
      expect.hasAssertions();

      request(server)
        .post('/auth/signin')
        .send({ email: 'a@a.com', password: '123456' })
        .expect(200)
        .end((err, res) => {
          const { body } = res;
          expect(body).toMatchObject({
            item: {
              id: expect.any(Number),
              email: 'a@a.com',
              first_name: 'a',
              last_name: 'b',
            },
            token: expect.any(String),
          });
          expect(body.item.hash).not.toBeDefined();

          const parsedToken: any = jwt.verify(body.token, process.env.JWT_SECRET);
          expect(parsedToken.id).toEqual(user.id);
          expect(parsedToken.email).toEqual('a@a.com');

          done(err);
        });
    });

    test('returns 401 if email does not exist', (done) => {
      request(server)
        .post('/auth/signin')
        .send({ email: 'WRONG@email.com', password: '123456' })
        .expect(401)
        .end(done);
    });

    test('returns 401 if password is wrong', (done) => {
      request(server)
        .post('/auth/signin')
        .send({ email: 'a@a.com', password: 'WRONG' })
        .expect(401)
        .end(done);
    });

    test('returns 403 if user is not confirmed', async (done) => {
      await user.$query().update({ confirmed: false });

      request(server)
        .post('/auth/signin')
        .send({ email: 'a@a.com', password: '123456' })
        .expect(403)
        .end((err, res) => {
          expect(res.body).toEqual({ code: 401, message: 'Email not confirmed' });
          done(err);
        });
    });
  });

  describe('POST /password/forgot', () => {
    beforeAll(async () => {
      await resetDatabase();
      await User.query().insert(
        { email: 'a@a.com', first_name: 'a', last_name: 'b', hash: PASSWORD_HASH },
      )
    });

    test('responds with a message', async (done) => {
      const sendRawEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
      testService({
        Email: { sendRawEmail },
      });

      expect.hasAssertions();

      request(server)
        .post('/auth/password/forgot')
        .send({ email: 'a@a.com' })
        .expect(200)
        .end((err, res) => {
          expect(res.body).toEqual({ message: 'An email with a password reset link was sent to your inbox' })

          done(err);
        });
    });
  });

  describe('PUT /signup/:id/confirm', () => {
    let user: User, token: string;

    beforeAll(async () => {
      await resetDatabase();
      user = await User.query().insertAndFetch(
        { email: 'a@a.com', first_name: 'a', last_name: 'b', hash: PASSWORD_HASH, confirmed: false }
      );
      token = SignupConfirmationService.tokenGenerator(user);
    });

    test('responds with a message', async (done) => {
      const sendRawEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
      testService({
        Email: { sendRawEmail },
      });

      expect.hasAssertions();

      request(server)
        .put(`/auth/signup/${user.id}/confirm?token=${token}`)
        .expect(200)
        .end(async (err, res) => {
          expect(res.body).toEqual({ item: user.toJson() })

          const confirmedUser = await User.query().findById(user.id);
          expect(confirmedUser.confirmed).toBeTruthy();

          done(err);
        });
    });
  });

  describe('PUT /password/:id/reset', () => {
    let user: User, token: string;

    beforeAll(async () => {
      await resetDatabase();
      user = await User.query().insertAndFetch(
        { email: 'a@a.com', first_name: 'a', last_name: 'b', hash: PASSWORD_HASH, confirmed: true }
      );
      token = PasswordService.resetPasswordTokenGenerator(user);
    });

    test('responds with a message', async (done) => {
      const sendRawEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
      testService({
        Email: { sendRawEmail },
      });

      expect.hasAssertions();

      request(server)
        .put(`/auth/password/${user.id}/reset?token=${token}`)
        .send({ password: 'STRONGPASS@', password_confirmation: 'STRONGPASS@' })
        .expect(200)
        .end(async (err, res) => {
          expect(res.body).toEqual({ item: user.toJson() });

          const updatedUser = await User.query().findById(user.id);
          expect(await bcrypt.compare('STRONGPASS@', updatedUser.hash)).toEqual(true);

          done(err);
        });
    });
  });

  describe('POST /signup/early_access', () => {
    beforeEach(async () => {
      await resetDatabase();
    });

    test('creates and return user without hash', async (done) => {
      expect.hasAssertions();
      const initialCount = await countModel(User);

      const sendRawEmail = jest.fn().mockReturnValue(Promise.resolve())
      testService({
        Email: { sendRawEmail },
      });

      request(server)
        .post('/auth/signup/early_access')
        .send({ email: 'a@a.com', first_name: 'a', last_name: 'b' })
        .expect(200)
        .end(async (err, res) => {
          const { body } = res;
          expect(body).toMatchObject({
            item: {
              id: expect.any(Number),
              email: 'a@a.com',
              first_name: 'a',
              last_name: 'b',
            },
          });
          expect(body.item.hash).not.toBeDefined();
          const finalCount = await countModel(User);

          expect(finalCount).toEqual(initialCount + 1);

          expect(sendRawEmail).toHaveBeenCalled();

          done(err);
        });
    });
  });

  describe('PUT /signup/early_access/:id/confirm', () => {
    let user: User, token: string;

    beforeAll(async () => {
      await resetDatabase();
      user = await User.query().insertAndFetch(
        { email: 'a@a.com', first_name: 'a', last_name: 'b', confirmed: false }
      );
      token = SignupConfirmationService.tokenGenerator(user);
    });

    test('responds with a message', async (done) => {
      const sendRawEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
      testService({
        Email: { sendRawEmail },
      });

      expect.hasAssertions();

      request(server)
        .put(`/auth/signup/early_access/${user.id}/confirm?token=${token}`)
        .send({ password: 'STRONGPASS@', password_confirmation: 'STRONGPASS@' })
        .expect(200)
        .end(async (err, res) => {
          expect(res.body).toEqual({ item: user.toJson() })

          const confirmedUser = await User.query().findById(user.id);
          expect(confirmedUser.confirmed).toBeTruthy();

          done(err);
        });
    });
  });
});
