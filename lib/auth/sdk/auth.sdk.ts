import { get, post, put } from '../../libUtils/sdk/Http';

interface Config {
  host?: string;
  version?: number;
  apiPrefix?: string;
  mode?: 'no-cors' | 'cors' | 'same-origin',
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Credentials {
  token: string;
  user: User;
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

const login = ({ host, apiPrefix }: Config) => (params: LoginParams): Promise<User> => {
  const url = `${host}${apiPrefix}/signin`;
  return post(url, params)
    .then(saveCredentials);
};

const isLoggedIn = (): Promise<boolean> => {
  return getCredentials().then(({ token }) => !!token);
}

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

const saveCredentials = ({ token, user }: Credentials): Promise<User> => {
  return new Promise<any>((resolve) => {
    if (!chrome?.storage) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return resolve(user);
    }

    chrome.storage.sync.set({
      user,
      token,
    }, function() {
      resolve(user);
    });
  });
};

const getCredentials = (): Promise<Credentials> => {
  return new Promise((resolve) => {
    if (!chrome?.storage) {
      const token = localStorage.getItem('token');
      const user: User = JSON.parse(localStorage.getItem('user'));
      return resolve({ token, user });
    }

    chrome.storage.sync
      .get(['token', 'user'], (credentials: Credentials) => resolve(credentials));
  });
};

const logout = (): Promise<void> => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  const chromePromise = new Promise<void>((resolve) => {
    if (!chrome?.storage) {
      return resolve();
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
  isLoggedIn: () => Promise<boolean>

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
    logout,
    isLoggedIn,

    forgotPassword: forgotPassword(config),
    resetPassword: resetPassword(config),

    profile: profile(config),
  };
};

if (window) {
  (window as any).AuthSDK = AuthSDK;
}

export default AuthSDK;
