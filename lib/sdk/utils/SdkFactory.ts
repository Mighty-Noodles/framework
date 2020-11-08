export interface Config {
  host?: string;
  version?: number;
  apiPrefix?: string;
  mode?: 'no-cors' | 'cors' | 'same-origin',
}

const DEFAULT_CONFIG: Config = {
  host: '',
  version: 1,
  mode: 'cors',
};

interface ISDK {
  [call: string]: any;
}

export const SdkFactory = (Sdk: any) => (config = DEFAULT_CONFIG): ISDK => {
  config.apiPrefix = config.apiPrefix || `/api/v${config.version || 1}`;
  return Sdk(config);
};
