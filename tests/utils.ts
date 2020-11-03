import { Model } from '../src/models/Model';
import { User } from '../src/models/User';

let TestService: any = {};

export const testService = (service: any): typeof TestService => {
  TestService = service;
  return TestService;
}

export { TestService };

export async function countModel(ModelClass: typeof Model): Promise<number> {
  return Number((await ModelClass.query<any>().count())[0].count);
}

export async function expectCountChangedBy(ModelClass: typeof Model, cb: () => void, count = 1): Promise<void> {
  const initCount = await countModel(ModelClass);

  await cb();

  const finalCount = await countModel(ModelClass);

  expect(finalCount).toEqual(initCount + count);
}

export async function resetDatabase(): Promise<void> {
  await User.query().delete();
}
