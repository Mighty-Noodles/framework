import { TestController } from '../../src/controllers/test.controller';
import { User } from '../../src/models/User';


describe('TestController', () => {
  let user1, user2;

  beforeAll(async () => {
    await User.query().delete();
    [user1, user2] = await User.query().insertAndFetch([
      { email: 'user1@email.com', first_name: 'User', last_name: 'One', hash: '1234' },
      { email: 'user1@email.com', first_name: 'User', last_name: 'Two', hash: '1234' },
    ])
  });

  test('index', async () => {
    const status = jest.fn();
    const json = jest.fn();
    status.mockReturnValueOnce({ json });

    const req: any = {};
    const res: any = { status };

    await TestController.index(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ items:
      [user1, user2]
    });
  });

  test('show', async () => {
    const status = jest.fn();
    const json = jest.fn();
    status.mockReturnValueOnce({ json });

    const req: any = { params: { id: user1.id } };
    const res: any = { status };

    await TestController.show(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ item: user1 });
  });
});
