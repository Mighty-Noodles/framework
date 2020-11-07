(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
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
const Http_1 = require("../../libUtils/sdk/Http");
const DEFAULT_CONFIG = {
    host: '',
    version: 1,
    mode: 'cors',
};
const signup = ({ host, apiPrefix }) => (params) => {
    const url = `${host}${apiPrefix}/signup`;
    return Http_1.post(url, params);
};
const earlyAccessSignup = ({ host, apiPrefix }) => (params) => {
    const url = `${host}${apiPrefix}/signup/early_access`;
    return Http_1.post(url, params);
};
const confirmEarlyAccessSignup = ({ host, apiPrefix }) => (params) => {
    const url = `${host}${apiPrefix}/signup/early_access/${params.id}/confirm`;
    return Http_1.put(url, params);
};
const login = ({ host, apiPrefix }) => (params) => {
    const url = `${host}${apiPrefix}/signin`;
    return Http_1.post(url, params)
        .then(({ item, token }) => __awaiter(void 0, void 0, void 0, function* () {
        return saveToken(token, item).then(() => item);
    }));
};
const forgotPassword = ({ host, apiPrefix }) => (params) => {
    const url = `${host}${apiPrefix}/password/forgot`;
    return Http_1.post(url, params);
};
const resetPassword = ({ host, apiPrefix }) => (params) => {
    const url = `${host}${apiPrefix}/password/${params.id}/reset`;
    return Http_1.put(url, params);
};
const profile = ({ host, apiPrefix }) => () => {
    const url = `${host}${apiPrefix}/profile`;
    return Http_1.get(url, { auth: true });
};
const saveToken = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', user);
    const chromePromise = new Promise((resolve) => {
        if (!chrome) {
            resolve();
        }
        chrome.storage.sync.set({
            user,
            token,
        }, function () {
            resolve();
        });
    });
    return chromePromise;
};
const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    const chromePromise = new Promise((resolve) => {
        if (!chrome) {
            resolve();
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
const AuthSDK = (config = DEFAULT_CONFIG) => {
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
    window.AuthSDK = AuthSDK;
}
exports.default = AuthSDK;

},{"../../libUtils/sdk/Http":2}],2:[function(require,module,exports){
"use strict";
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
function defaultHeaders(opts) {
    const token = opts.auth ? localStorage.getItem('token') : null;
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (token) {
        headers.append('Authorization', `JWT ${token}`);
    }
    return headers;
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
        headers: defaultHeaders(opts),
    })
        .then(formatResponse);
});
exports.del = (url, opts = {}) => __awaiter(void 0, void 0, void 0, function* () {
    return fetch(url, {
        method: 'DELETE',
        headers: defaultHeaders(opts),
    })
        .then(formatResponse);
});
exports.post = (url, body = {}, opts = {}) => __awaiter(void 0, void 0, void 0, function* () {
    return fetch(url, {
        method: 'POST',
        headers: defaultHeaders(opts),
        body: JSON.stringify(body),
    })
        .then(formatResponse);
});
exports.put = (url, body = {}, opts = {}) => __awaiter(void 0, void 0, void 0, function* () {
    return fetch(url, {
        method: 'PUT',
        headers: defaultHeaders(opts),
        body: JSON.stringify(body),
    })
        .then(formatResponse);
});

},{}]},{},[1]);
