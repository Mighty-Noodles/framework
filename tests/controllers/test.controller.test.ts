import { TestController } from '../../src/controllers/test.controller';

describe('TestController', () => {
  test('index', () => {
    const status = jest.fn();
    const json = jest.fn();
    status.mockReturnValueOnce({ json });

    const req: any = {};
    const res: any = { status };

    TestController.index(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ hello: 'world' });
  });

  test('show', () => {
    const status = jest.fn();
    const json = jest.fn();
    status.mockReturnValueOnce({ json });

    const req: any = { params: { id: '123' } };
    const res: any = { status };

    TestController.show(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ id: '123' });
  });
});
