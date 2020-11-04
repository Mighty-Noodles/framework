import request from 'supertest';
import jwt from 'jsonwebtoken';

import { User } from '../../models/User';
import { server } from '../../server';
import { PASSWORD_HASH } from '../../../tests/constants';
import { countModel, resetDatabase, testService } from '../../../tests/utils';
import { ConfirmationService } from '../../services/auth/Confirmation.service';

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
        .post('/api/v1/signup')
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
        .post('/api/v1/signin')
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
        .post('/api/v1/signin')
        .send({ email: 'WRONG@email.com', password: '123456' })
        .expect(401)
        .end(done);
    });

    test('returns 401 if password is wrong', (done) => {
      request(server)
        .post('/api/v1/signin')
        .send({ email: 'a@a.com', password: 'WRONG' })
        .expect(401)
        .end(done);
    });

    test('returns 403 if user is not confirmed', async (done) => {
      await user.$query().update({ confirmed: false });

      request(server)
        .post('/api/v1/signin')
        .send({ email: 'a@a.com', password: '123456' })
        .expect(403)
        .end((err, res) => {
          expect(res.body).toEqual({ code: 402, message: 'Email not confirmed' });
          done(err);
        });
    });
  });

  describe('PUT /password/reset', () => {
    test.todo('resets user password');
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
        .post('/api/v1/password/forgot')
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
      token = ConfirmationService.tokenGenerator(user);
    });

    test('responds with a message', async (done) => {
      const sendRawEmail = jest.fn().mockReturnValueOnce(Promise.resolve());
      testService({
        Email: { sendRawEmail },
      });

      expect.hasAssertions();

      request(server)
        .put(`/api/v1/signup/${user.id}/confirm?token=${token}`)
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
