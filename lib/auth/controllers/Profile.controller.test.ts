import { ProfileController } from './Profile.controller';
import { User } from '../models/User';
import { resetDatabase } from '../../libUtils/testUtils';

describe('ProfileController', () => {
  let user;

  beforeEach(async () => {
    await resetDatabase();
    user = await User.query().insertAndFetch(
      { email: 'user@email.com', first_name: 'User', last_name: 'One', hash: '123' },
    )
  });

  describe('index', () => {
    test('return user', async () => {
      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = { user };
      const res: any = { status };

      ProfileController.index(req, res);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({ item: user.toJson() });

      expect(json.mock.calls[0][0].item.email).toBeDefined();
      expect(json.mock.calls[0][0].item.hash).not.toBeDefined();
    });

    test('hides hash', async () => {
      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = { user };
      const res: any = { status };

      ProfileController.index(req, res);

      expect(json.mock.calls[0][0].item.email).toBeDefined();
      expect(json.mock.calls[0][0].item.hash).not.toBeDefined();
    });
  });

  describe('update', () => {
    test('updates valid params', async () => {
      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = { user, body: { user: { first_name: 'New', last_name: 'Name' }} };
      const res: any = { status };

      await ProfileController.update(req, res);

      expect(status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith({ item:
        expect.objectContaining({
          first_name: 'New',
          last_name: 'Name',
        }),
      });
    });

    test('returns new updated user', async () => {
      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const req: any = { user, body: { user: { first_name: 'New', last_name: 'Name' }} };
      const res: any = { status };

      await ProfileController.update(req, res);

      expect(json.mock.calls[0][0].item.first_name).toEqual('New');
      expect(json.mock.calls[0][0].item.last_name).toEqual('Name');
      expect(json.mock.calls[0][0].item.hash).not.toBeDefined();
    });

    test('skips email', async () => {
      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const newEmail = 'new@email.com';

      const req: any = { user, body: { user: { email: newEmail }} };
      const res: any = { status };

      await ProfileController.update(req, res);

      const newUser = await User.query().findById(user.id);

      expect(newUser.email).toEqual('user@email.com');
    });

    test('skips hash', async () => {
      const status = jest.fn();
      const json = jest.fn();
      status.mockReturnValueOnce({ json });

      const newHash = 'new-hash';
      const req: any = { user, body: { user: { hash: newHash }} };
      const res: any = { status };

      await ProfileController.update(req, res);

      const newUser = await User.query().findById(user.id);

      expect(newUser.hash).toEqual('123');
    });
  });
});
