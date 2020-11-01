import request from 'supertest';
import { User } from '../../../src/models/User';
import { server } from '../../../src/server';
import { PASSWORD_HASH } from '../../constants';
import { countModel } from '../../utils';

describe('/auth route', () => {
  describe('POST /signup', () => {
    beforeEach(async () => {
      await User.query().delete();
    });

    test('creates and return user without hash', async (done) => {
      expect.hasAssertions();
      const initialCount = await countModel(User);

      request(server)
        .post('/api/v1/signup')
        .send({ email: 'a@a.com', first_name: 'a', last_name: 'b', password: 'StR0NGP@SS!', password_confirmation: 'StR0NGP@SS!' })
        .expect(200)
        .expect(async (res) => {
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
          const finalCount = await countModel(User);

          expect(finalCount).toEqual(initialCount + 1);
        })
        .end(done);
    });
  });

  describe('POST /signin', () => {
    beforeAll(async () => {
      await User.query().delete();
      await User.query().insert(
        { email: 'a@a.com', first_name: 'a', last_name: 'b', hash: PASSWORD_HASH },
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
  });
});
