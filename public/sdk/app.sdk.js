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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthSDK = exports.getToken = void 0;
var Http_1 = require("./utils/Http");
var SdkFactory_1 = require("./utils/SdkFactory");
var Validation_1 = require("./utils/Validation");
var signup = function (_a) {
    var host = _a.host, apiPrefix = _a.apiPrefix;
    return function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Validation_1.validate(params, ['email', 'first_name', 'password', 'password_confirmation'])];
                case 1:
                    _a.sent();
                    url = "" + host + apiPrefix + "/signup";
                    return [2 /*return*/, Http_1.post(url, params)];
            }
        });
    }); };
};
var confirmSignup = function (_a) {
    var host = _a.host, apiPrefix = _a.apiPrefix;
    return function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Validation_1.validate(params, ['id', 'token'])];
                case 1:
                    _a.sent();
                    url = "" + host + apiPrefix + "/signup/" + params.id + "/confirm";
                    return [2 /*return*/, Http_1.put(url, params)];
            }
        });
    }); };
};
var earlyAccessSignup = function (_a) {
    var host = _a.host, apiPrefix = _a.apiPrefix;
    return function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Validation_1.validate(params, ['email', 'first_name'])];
                case 1:
                    _a.sent();
                    url = "" + host + apiPrefix + "/signup/early_access";
                    return [2 /*return*/, Http_1.post(url, params)];
            }
        });
    }); };
};
var confirmEarlyAccessSignup = function (_a) {
    var host = _a.host, apiPrefix = _a.apiPrefix;
    return function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Validation_1.validate(params, ['id', 'token', 'password', 'password_confirmation'])];
                case 1:
                    _a.sent();
                    url = "" + host + apiPrefix + "/signup/early_access/" + params.id + "/confirm";
                    return [2 /*return*/, Http_1.put(url, params)];
            }
        });
    }); };
};
var login = function (_a) {
    var host = _a.host, apiPrefix = _a.apiPrefix;
    return function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Validation_1.validate(params, ['email', 'password'])];
                case 1:
                    _a.sent();
                    url = "" + host + apiPrefix + "/login";
                    return [2 /*return*/, Http_1.post(url, params)
                            .then(saveCredentials)];
            }
        });
    }); };
};
var isLoggedIn = function () {
    return getCredentials().then(function (_a) {
        var token = _a.token;
        return !!token;
    });
};
var getToken = function () {
    return getCredentials().then(function (_a) {
        var token = _a.token;
        return token;
    });
};
exports.getToken = getToken;
var forgotPassword = function (_a) {
    var host = _a.host, apiPrefix = _a.apiPrefix;
    return function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Validation_1.validate(params, ['email'])];
                case 1:
                    _a.sent();
                    url = "" + host + apiPrefix + "/password/forgot";
                    return [2 /*return*/, Http_1.post(url, params)];
            }
        });
    }); };
};
var resetPassword = function (_a) {
    var host = _a.host, apiPrefix = _a.apiPrefix;
    return function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var url;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, Validation_1.validate(params, ['id', 'token', 'password', 'password_confirmation'])];
                case 1:
                    _a.sent();
                    url = "" + host + apiPrefix + "/password/" + params.id + "/reset";
                    return [2 /*return*/, Http_1.put(url, params)];
            }
        });
    }); };
};
var profile = function (_a) {
    var host = _a.host, apiPrefix = _a.apiPrefix;
    return function () {
        var url = "" + host + apiPrefix + "/profile";
        return Http_1.get(url, { token: getToken() });
    };
};
var saveCredentials = function (_a) {
    var token = _a.token, user = _a.user;
    return new Promise(function (resolve) {
        if (!(chrome === null || chrome === void 0 ? void 0 : chrome.storage)) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            return resolve(user);
        }
        chrome.storage.sync.set({
            user: user,
            token: token,
        }, function () {
            resolve(user);
        });
    });
};
var getCredentials = function () {
    return new Promise(function (resolve) {
        if (!(chrome === null || chrome === void 0 ? void 0 : chrome.storage)) {
            var userParams = localStorage.getItem('user');
            var user = userParams !== 'undefined' ? JSON.parse(userParams) : undefined;
            var token = localStorage.getItem('token');
            return resolve({ token: token, user: user });
        }
        chrome.storage.sync
            .get(['token', 'user'], function (credentials) { return resolve(credentials); });
    });
};
var logout = function () {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    var chromePromise = new Promise(function (resolve) {
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
var AuthSDK = SdkFactory_1.SdkFactory(function (config) {
    return {
        signup: signup(config),
        confirmSignup: confirmSignup(config),
        earlyAccessSignup: earlyAccessSignup(config),
        confirmEarlyAccessSignup: confirmEarlyAccessSignup(config),
        login: login(config),
        logout: logout,
        isLoggedIn: isLoggedIn,
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.put = exports.post = exports.del = exports.get = void 0;
function buildHeader(_a) {
    var token = _a.token;
    return __awaiter(this, void 0, void 0, function () {
        var headers, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    headers = new Headers();
                    headers.append('Content-Type', 'application/json');
                    if (!token) return [3 /*break*/, 2];
                    _c = (_b = headers).append;
                    _d = ['Authorization'];
                    _e = "JWT ";
                    return [4 /*yield*/, token];
                case 1:
                    _c.apply(_b, _d.concat([_e + (_f.sent())]));
                    _f.label = 2;
                case 2: return [2 /*return*/, headers];
            }
        });
    });
}
var formatResponse = function (res) { return __awaiter(void 0, void 0, void 0, function () {
    var body;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, res
                    .clone()
                    .json()
                    .catch(function () { return ({}); })];
            case 1:
                body = _a.sent();
                if (res.ok) {
                    return [2 /*return*/, body];
                }
                return [2 /*return*/, Promise.reject(body)];
        }
    });
}); };
exports.get = function (url, opts) {
    if (opts === void 0) { opts = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = fetch;
                    _b = [url];
                    _c = {
                        method: 'GET'
                    };
                    return [4 /*yield*/, buildHeader(opts)];
                case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([(_c.headers = _d.sent(),
                            _c)]))
                        .then(formatResponse)];
            }
        });
    });
};
exports.del = function (url, opts) {
    if (opts === void 0) { opts = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = fetch;
                    _b = [url];
                    _c = {
                        method: 'DELETE'
                    };
                    return [4 /*yield*/, buildHeader(opts)];
                case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([(_c.headers = _d.sent(),
                            _c)]))
                        .then(formatResponse)];
            }
        });
    });
};
exports.post = function (url, body, opts) {
    if (body === void 0) { body = {}; }
    if (opts === void 0) { opts = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = fetch;
                    _b = [url];
                    _c = {
                        method: 'POST'
                    };
                    return [4 /*yield*/, buildHeader(opts)];
                case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([(_c.headers = _d.sent(),
                            _c.body = JSON.stringify(body),
                            _c)]))
                        .then(formatResponse)];
            }
        });
    });
};
exports.put = function (url, body, opts) {
    if (body === void 0) { body = {}; }
    if (opts === void 0) { opts = {}; }
    return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _a = fetch;
                    _b = [url];
                    _c = {
                        method: 'PUT'
                    };
                    return [4 /*yield*/, buildHeader(opts)];
                case 1: return [2 /*return*/, _a.apply(void 0, _b.concat([(_c.headers = _d.sent(),
                            _c.body = JSON.stringify(body),
                            _c)]))
                        .then(formatResponse)];
            }
        });
    });
};

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SdkFactory = void 0;
var DEFAULT_CONFIG = {
    host: '',
    version: 1,
    mode: 'cors',
};
exports.SdkFactory = function (Sdk) { return function (config) {
    if (config === void 0) { config = DEFAULT_CONFIG; }
    config.apiPrefix = config.apiPrefix || "/api/v" + (config.version || 1);
    return Sdk(config);
}; };

},{}],5:[function(require,module,exports){
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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
exports.validate = function (params, mandatoryParams) { return __awaiter(void 0, void 0, void 0, function () {
    var paramKeys;
    return __generator(this, function (_a) {
        paramKeys = Object.keys(params);
        mandatoryParams.forEach(function (prop) {
            if (!paramKeys.includes(prop)) {
                return Promise.reject(new Error(prop + " is missing"));
            }
            if (params[prop] === '') {
                return Promise.reject(new Error(prop + " should not be empty"));
            }
        });
        return [2 /*return*/, true];
    });
}); };

},{}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppSDK = void 0;
var sdk_1 = require("../../lib/sdk/");
var AppSDK = sdk_1.SdkFactory(function (config) {
    return {};
});
exports.AppSDK = AppSDK;
if (window) {
    window.AppSDK = sdk_1.SdkFactory(AppSDK);
}

},{"../../lib/sdk/":2}]},{},[1,6]);
