import { get, post, put } from '../../libUtils/sdk/Http';

interface Config {
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

interface SignupParams {
  email: string;
  first_name: string;
  last_name?: string;
  password: string;
  password_confirmation: string;
}

interface EarlyAccessSignupParams {
  email: string;
  first_name: string;
  last_name?: string;
}

interface EarlyAccessSignupConfirmParams {
  id: string | number;
  token: string;
  password: string;
  passwordConfirmation: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface ResetPasswordParams {
  id: string | number;
  token: string;
  password: string;
  passwordConfirmation: string;
}

interface ForgotPaswordParams {
  email: string;
}

const signup = ({ host, apiPrefix }: Config) => (params: SignupParams): Promise<any> => {
  const url = `${host}${apiPrefix}/signup`;
  return post(url, params);
}

const earlyAccessSignup = ({ host, apiPrefix }: Config) => (params: EarlyAccessSignupParams): Promise<any> => {
  const url = `${host}${apiPrefix}/signup/early_access`;
  return post(url, params);
};

const confirmEarlyAccessSignup = ({ host, apiPrefix }: Config) => (params: EarlyAccessSignupConfirmParams): Promise<any> => {
  const url = `${host}${apiPrefix}/signup/early_access/${params.id}/confirm`;
  return put(url, params);
};

const login = ({ host, apiPrefix }: Config) => (params: LoginParams): Promise<any> => {
  const url = `${host}${apiPrefix}/signin`;
  return post(url, params)
    .then(async ({ item, token }) => {
      return saveToken(token, item).then(() => item);
    });
};

const forgotPassword = ({ host, apiPrefix }: Config) => (params: ForgotPaswordParams): Promise<any> => {
  const url = `${host}${apiPrefix}/password/forgot`;
  return post(url, params);
};

const resetPassword = ({ host, apiPrefix }: Config) => (params: ResetPasswordParams): Promise<any> => {
  const url = `${host}${apiPrefix}/password/${params.id}/reset`;
  return put(url, params);
};

const profile = ({ host, apiPrefix }: Config) => (): Promise<any> => {
  const url = `${host}${apiPrefix}/profile`;
  return get(url, { auth: true });
};

const saveToken = (token: string, user: any): Promise<void> => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', user);

  const chromePromise = new Promise<void>((resolve) => {
    if (!chrome) {
      resolve();
    }

    chrome.storage.sync.set({
      user,
      token,
    }, function() {
      resolve();
    });
  });

  return chromePromise;
};

const logout = (): Promise<void> => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  const chromePromise = new Promise<void>((resolve) => {
    if (!chrome) {
      resolve();
    }

    chrome.storage.sync.set({
      user: null,
      token: null,
    }, function() {
      resolve();
    });
  });

  return chromePromise;
};

interface IAuthSDK {
  signup: (params: SignupParams) => Promise<any>,

  earlyAccessSignup: (params: EarlyAccessSignupParams) => Promise<any>,
  confirmEarlyAccessSignup: (params: EarlyAccessSignupConfirmParams) => Promise<any>,

  login: (params: LoginParams) => Promise<any>,
  logout: () => Promise<any>,

  forgotPassword: (params: ForgotPaswordParams) => Promise<any>,
  resetPassword: (params: ResetPasswordParams) => Promise<any>,

  profile: () => Promise<any>,
}

const AuthSDK = (config = DEFAULT_CONFIG): IAuthSDK => {
  config.apiPrefix = config.apiPrefix || `/api/v${config.version || 1}/`;

  return {
    signup: signup(config),

    earlyAccessSignup: earlyAccessSignup(config),
    confirmEarlyAccessSignup: confirmEarlyAccessSignup(config),

    login: login(config),
    logout: logout,

    forgotPassword: forgotPassword(config),
    resetPassword: resetPassword(config),

    profile: profile(config),
  };
};

if (window) {
  (window as any).AuthSDK = AuthSDK;
}

export default AuthSDK;
