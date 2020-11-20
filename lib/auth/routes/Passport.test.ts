import request from 'supertest';

import { server } from '../test/server';
import { jwtHeader } from '../test/constants';
import { resetDatabase } from '../../libUtils/testUtils';

import { User } from '../models/User';

describe('Passport', () => {
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

  describe('JWT', () => {
    test('authorizes ', (done) => {
      request(testServer)
        .get('/profile')
        .set('Authorization', jwt)
        .expect(200)
        .end(done);
    });

    test('return 401 when token is invalid', (done) => {
      request(testServer)
        .get('/profile')
        .set('Authorization', 'JWT wrong')
        .expect(401)
        .end((err, res) => {
          console.log(res.body)
          done(err);
        })
    });

    test('return 401 when token is missing', (done) => {
      request(testServer)
        .get('/profile')
        .expect(401)
        .end(done)
    });
  });
});
