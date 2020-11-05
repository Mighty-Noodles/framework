import { Model } from '@db/Model';
import { User } from '@auth/models/User';

let TestService: any = {};

export const testService = (service: Record<string, unknown>): typeof TestService => {
  TestService = service;
  return TestService;
}

export { TestService };

export async function countModel(ModelClass: typeof Model): Promise<number> {
  return Number((await ModelClass.query<any>().count())[0].count);
}

export async function expectCountChangedBy(ModelClass: typeof Model, cb: () => any, count = 1): Promise<any> {
  const initCount = await countModel(ModelClass);

  const result = await cb();

  const finalCount = await countModel(ModelClass);

  expect(finalCount).toEqual(initCount + count);

  return result;
}

export async function resetDatabase(): Promise<void> {
  await User.query().delete();
}
