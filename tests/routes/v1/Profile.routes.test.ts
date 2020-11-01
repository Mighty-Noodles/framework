import request from 'supertest';
import { User } from '../../../src/models/User';
import { server } from '../../../src/server';
import { jwtHeader } from '../../constants';
import { resetDatabase } from '../../utils';

describe('/profile route', () => {
  let testServer, user: User, jwt;

  beforeEach(async () => {
    await resetDatabase();
    user = await User.query().insertAndFetch(
      { email: 'user@email.com', first_name: 'User', last_name: 'One', hash: '123' },
    );
    jwt = jwtHeader(user);
  });

  beforeEach(() => {
    testServer = server;
  });

  afterEach(() => {
    testServer.close();
  });

  describe('GET /', () => {
    test('returns user', (done) => {
      request(testServer)
        .get('/api/v1/profile')
        .set('Authorization', jwt)
        .expect((res) => {
          const { body } = res;
          expect(body).toMatchObject({
            item: {
              id: user.id,
              email: 'user@email.com',
              first_name: 'User',
              last_name: 'One',
            },
          });
          expect(body.item.hash).not.toBeDefined();
        })
        .expect(200)
        .end(done);
    });

    test('authenticates with JWT', (done) => {
      request(testServer)
        .get('/api/v1/profile')
        .expect(401)
        .end(done)
    });
  });

  describe('PUT /', () => {
    test('updates user', (done) => {
      request(testServer)
        .put('/api/v1/profile')
        .send({ user: { first_name: 'New', last_name: 'User', email: 'A@email.com' } })
        .set('Authorization', jwt)
        .expect((res) => {
          const { body } = res;
          expect(body).toMatchObject({
            item: {
              email: 'user@email.com',
              first_name: 'New',
              last_name: 'User',
            },
          });
          expect(body.item.hash).not.toBeDefined();
        })
        .expect(200)
        .end(done);
    });

    test('authenticates with JWT', (done) => {
      request(testServer)
        .put('/api/v1/profile')
        .expect(401)
        .end(done)
    });
  });
});
