import { get, post, put } from './utils/Http';
import { SdkFactory, Config } from './utils/SdkFactory';
import { validate } from './utils/Validation';

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

interface SignupConfirmationParams {
  id: string | number;
  token: string;
}

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

const signup = ({ host, apiPrefix }: Config) => async (params: SignupParams): Promise<any> => {
  await validate(params, ['email', 'first_name', 'password', 'password_confirmation']);

  const url = `${host}${apiPrefix}/signup`;
  return post(url, params);
}

const confirmSignup = ({ host, apiPrefix }: Config) => async (params: SignupConfirmationParams): Promise<any> => {
  await validate(params, ['id', 'token']);

  const url = `${host}${apiPrefix}/signup/${params.id}/confirm`;
  return put(url, params);
};

const earlyAccessSignup = ({ host, apiPrefix }: Config) => async (params: EarlyAccessSignupParams): Promise<any> => {
  await validate(params, ['email', 'first_name']);

  const url = `${host}${apiPrefix}/signup/early_access`;
  return post(url, params);
};

const confirmEarlyAccessSignup = ({ host, apiPrefix }: Config) => async (params: EarlyAccessSignupConfirmParams): Promise<any> => {
  await validate(params, ['id', 'token', 'password', 'password_confirmation']);

  const url = `${host}${apiPrefix}/signup/early_access/${params.id}/confirm`;
  return put(url, params);
};

const login = ({ host, apiPrefix }: Config) => async (params: LoginParams): Promise<User> => {
  await validate(params, ['email', 'password']);

  const url = `${host}${apiPrefix}/login`;
  return post(url, params)
    .then(({ token, item }) => saveCredentials({ token, user: item }));
};

const isLoggedIn = (): Promise<boolean> => {
  return getCredentials().then(({ token }) => !!token);
};

const getToken = (): Promise<string> => {
  return getCredentials().then(({ token }) => token);
}

const forgotPassword = ({ host, apiPrefix }: Config) => async (params: ForgotPaswordParams): Promise<any> => {
  await validate(params, ['email']);

  const url = `${host}${apiPrefix}/password/forgot`;
  return post(url, params);
};

const resetPassword = ({ host, apiPrefix }: Config) => async (params: ResetPasswordParams): Promise<any> => {
  await validate(params, ['id', 'token', 'password', 'password_confirmation']);

  const url = `${host}${apiPrefix}/password/${params.id}/reset`;
  return put(url, params);
};

const profile = ({ host, apiPrefix }: Config) => (): Promise<any> => {
  const url = `${host}${apiPrefix}/profile`;
  return get(url, { token: getToken() });
};

const saveCredentials = ({ token, user }: Credentials): Promise<User> => {
  return new Promise<any>((resolve) => {
    if (!isChromeExtension()) {
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

const isChromeExtension = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome?.storage;
};

const getCredentials = (): Promise<Credentials> => {
  return new Promise((resolve) => {
    if (!isChromeExtension()) {
      const userParams = localStorage.getItem('user');
      const user: User = userParams !== 'undefined' ? JSON.parse(userParams) : undefined;
      const token = localStorage.getItem('token');

      return resolve({ token, user });
    }

    chrome.storage.sync
      .get(['token', 'user'], (credentials: Credentials) => resolve(credentials));
  });
};

const logout = (): Promise<void> => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  return new Promise<void>((resolve) => {
    if (!isChromeExtension()) {
      return resolve();
    }

    chrome.storage.sync.set({
      user: null,
      token: null,
    }, function() {
      resolve();
    });
  });
};

export {
  getToken,
}

const AuthSDK = SdkFactory((config: Config) => {
  return {
    signup: signup(config),
    confirmSignup: confirmSignup(config),

    earlyAccessSignup: earlyAccessSignup(config),
    confirmEarlyAccessSignup: confirmEarlyAccessSignup(config),

    login: login(config),
    logout,
    isLoggedIn,

    forgotPassword: forgotPassword(config),
    resetPassword: resetPassword(config),

    profile: profile(config),
  };
});

if (window) {
  (window as any).AuthSDK = AuthSDK;
}

export { AuthSDK };
