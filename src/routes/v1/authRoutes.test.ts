import request from 'supertest';

import { server } from '../../server';
import { User } from '../../../lib/auth/models/User';
import { resetDatabase } from '../../../lib/libUtils/testUtils';

describe('/auth route definitions', () => {
  let user: User;

  beforeAll(async () => {
    await resetDatabase();
    user = await User.query().insertAndFetch({
      email: 'user@email.com',
      first_name: 'John',
    });
  });

  test('POST /signup', (done) => {
    request(server)
      .post('/api/v1/signup')
      .expect(422)
      .end(done);
  });

  test('get /signup/:id/confirm', (done) => {
    request(server)
      .get(`/api/v1/signup/${user.id}/confirm`)
      .expect(401)
      .end(done);
  });

  test('put /signup/:id/confirm', (done) => {
    request(server)
      .put(`/api/v1/signup/${user.id}/confirm`)
      .expect(401)
      .end(done);
  });

  test('POST /signup/early_access', (done) => {
    request(server)
      .post(`/api/v1/signup/early_access`)
      .expect(422)
      .end(done);
  });

  test('PUT /signup/early_access/:id/confirm', (done) => {
    request(server)
      .put(`/api/v1/signup/early_access/${user.id}/confirm`)
      .expect(401)
      .end(done);
  });

  test('POST /login', (done) => {
    request(server)
      .post('/api/v1/login')
      .expect(401)
      .end(done);
  });

  test('POST /password/forgot', (done) => {
    request(server)
      .post(`/api/v1/password/forgot`)
      .expect(200)
      .end(done);
  });

  test('PUT /password/:id/reset', (done) => {
    request(server)
      .put(`/api/v1/password/${user.id}/reset`)
      .expect(401)
      .end(done);
  });

  test('GET /login', (done) => {
    request(server)
      .get(`/login`)
      .expect(200)
      .end(done);
  });

  test('GET /password/forgot', (done) => {
    request(server)
      .get(`/password/forgot`)
      .expect(200)
      .end(done);
  });

  test('GET /password/:id/reset', (done) => {
    request(server)
      .get(`/password/${user.id}/reset`)
      .expect(200)
      .end(done);
  });

  test('GET /signup/early_access', (done) => {
    request(server)
      .get(`/signup/early_access`)
      .expect(200)
      .end(done);
  });

  test('GET /signup/early_access/${user.id}/confirm', (done) => {
    request(server)
      .get(`/signup/early_access/${user.id}/confirm`)
      .expect(200)
      .end(done);
  });

  test('GET /signup', (done) => {
    request(server)
      .get(`/signup`)
      .expect(200)
      .end(done);
  });
});
