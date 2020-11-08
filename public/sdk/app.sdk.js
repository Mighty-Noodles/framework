(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSDK = exports.getToken = void 0;
const Http_1 = require("./utils/Http");
const SdkFactory_1 = require("./utils/SdkFactory");
const Validation_1 = require("./utils/Validation");
const signup = ({ host, apiPrefix }) => (params) => {
    Validation_1.validate(params, ['email', 'first_name', 'password', 'password_confirmation']);
    const url = `${host}${apiPrefix}/signup`;
    return Http_1.post(url, params);
};
const earlyAccessSignup = ({ host, apiPrefix }) => (params) => {
    Validation_1.validate(params, ['email', 'first_name']);
    const url = `${host}${apiPrefix}/signup/early_access`;
    return Http_1.post(url, params);
};
const confirmEarlyAccessSignup = ({ host, apiPrefix }) => (params) => {
    Validation_1.validate(params, ['id', 'token', 'password', 'password_confirmation']);
    const url = `${host}${apiPrefix}/signup/early_access/${params.id}/confirm`;
    return Http_1.put(url, params);
};
const login = ({ host, apiPrefix }) => (params) => {
    Validation_1.validate(params, ['email', 'password']);
    const url = `${host}${apiPrefix}/signin`;
    return Http_1.post(url, params)
        .then(saveCredentials);
};
const isLoggedIn = () => {
    return getCredentials().then(({ token }) => !!token);
};
const getToken = () => {
    return getCredentials().then(({ token }) => token);
};
exports.getToken = getToken;
const forgotPassword = ({ host, apiPrefix }) => (params) => {
    Validation_1.validate(params, ['email']);
    const url = `${host}${apiPrefix}/password/forgot`;
    return Http_1.post(url, params);
};
const resetPassword = ({ host, apiPrefix }) => (params) => {
    Validation_1.validate(params, ['id', 'token', 'password', 'password_confirmation']);
    const url = `${host}${apiPrefix}/password/${params.id}/reset`;
    return Http_1.put(url, params);
};
const profile = ({ host, apiPrefix }) => () => {
    const url = `${host}${apiPrefix}/profile`;
    return Http_1.get(url, { token: getToken() });
};
const saveCredentials = ({ token, user }) => {
    return new Promise((resolve) => {
        if (!(chrome === null || chrome === void 0 ? void 0 : chrome.storage)) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            return resolve(user);
        }
        chrome.storage.sync.set({
            user,
            token,
        }, function () {
            resolve(user);
        });
    });
};
const getCredentials = () => {
    return new Promise((resolve) => {
        if (!(chrome === null || chrome === void 0 ? void 0 : chrome.storage)) {
            const userParams = localStorage.getItem('user');
            const user = userParams !== 'undefined' ? JSON.parse(userParams) : undefined;
            const token = localStorage.getItem('token');
            return resolve({ token, user });
        }
        chrome.storage.sync
            .get(['token', 'user'], (credentials) => resolve(credentials));
    });
};
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const chromePromise = new Promise((resolve) => {
        if (!(chrome === null || chrome === void 0 ? void 0 : chrome.storage)) {
            return resolve();
        }
        chrome.storage.sync.set({
            user: null,
            token: null,
        }, function () {
            resolve();
        });
    });
    return chromePromise;
};
const AuthSDK = SdkFactory_1.SdkFactory((config) => {
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
});
exports.AuthSDK = AuthSDK;
if (window) {
    window.AuthSDK = AuthSDK;
}

},{"./utils/Http":3,"./utils/SdkFactory":4,"./utils/Validation":5}],2:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./utils/SdkFactory"), exports);
__exportStar(require("./utils/Http"), exports);
__exportStar(require("./utils/Validation"), exports);
__exportStar(require("./auth.sdk"), exports);

},{"./auth.sdk":1,"./utils/Http":3,"./utils/SdkFactory":4,"./utils/Validation":5}],3:[function(require,module,exports){
"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.put = exports.post = exports.del = exports.get = void 0;
function buildHeader({ token }) {
    return __awaiter(this, void 0, void 0, function* () {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        if (token) {
            headers.append('Authorization', `JWT ${yield token}`);
        }
        return headers;
    });
}
const formatResponse = (res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = yield res
        .clone()
        .json()
        .catch(() => ({}));
    if (res.ok) {
        return body;
    }
    return Promise.reject(body);
});
exports.get = (url, opts = {}) => __awaiter(void 0, void 0, void 0, function* () {
    return fetch(url, {
        method: 'GET',
        headers: yield buildHeader(opts),
    })
        .then(formatResponse);
});
exports.del = (url, opts = {}) => __awaiter(void 0, void 0, void 0, function* () {
    return fetch(url, {
        method: 'DELETE',
        headers: yield buildHeader(opts),
    })
        .then(formatResponse);
});
exports.post = (url, body = {}, opts = {}) => __awaiter(void 0, void 0, void 0, function* () {
    return fetch(url, {
        method: 'POST',
        headers: yield buildHeader(opts),
        body: JSON.stringify(body),
    })
        .then(formatResponse);
});
exports.put = (url, body = {}, opts = {}) => __awaiter(void 0, void 0, void 0, function* () {
    return fetch(url, {
        method: 'PUT',
        headers: yield buildHeader(opts),
        body: JSON.stringify(body),
    })
        .then(formatResponse);
});

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdkFactory = void 0;
const DEFAULT_CONFIG = {
    host: '',
    version: 1,
    mode: 'cors',
};
exports.SdkFactory = (Sdk) => (config = DEFAULT_CONFIG) => {
    config.apiPrefix = config.apiPrefix || `/api/v${config.version || 1}`;
    return Sdk(config);
};

},{}],5:[function(require,module,exports){
"use strict";
/* eslint-disable @typescript-eslint/no-explicit-any */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
exports.validate = (params, mandatoryParams) => {
    const paramKeys = Object.keys(params);
    mandatoryParams.forEach(prop => {
        if (!paramKeys.includes(prop)) {
            throw (new Error(`${prop} is missing`));
        }
        if (params[prop] === '') {
            throw (new Error(`${prop} should not be empty`));
        }
    });
    return true;
};

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppSDK = void 0;
const sdk_1 = require("../../lib/sdk/");
const AppSDK = sdk_1.SdkFactory((config) => {
    return {};
});
exports.AppSDK = AppSDK;
if (window) {
    window.AppSDK = sdk_1.SdkFactory(AppSDK);
}

},{"../../lib/sdk/":2}]},{},[1,6]);
