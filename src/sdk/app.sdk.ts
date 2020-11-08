import { SdkFactory, Config } from '../../lib/sdk/';

const AppSDK = SdkFactory((config: Config) => {
  return {
  };
});

if (window) {
  (window as any).AppSDK = SdkFactory(AppSDK);
}

export { AppSDK };
