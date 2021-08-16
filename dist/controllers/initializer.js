"use strict";
/*
 * This file is part of WPPConnect.
 *
 * WPPConnect is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * WPPConnect is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with WPPConnect.  If not, see <https://www.gnu.org/licenses/>.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.create = void 0;
var whatsapp_1 = require("../api/whatsapp");
var create_config_1 = require("../config/create-config");
var browser_1 = require("./browser");
var welcome_1 = require("./welcome");
var enum_1 = require("../api/model/enum");
function create(sessionOrOption, catchQR, statusFind, options, browserSessionToken) {
    return __awaiter(this, void 0, void 0, function () {
        var session, usingDeprecatedCreate, mergedOptions, logger, browser, page, client_1, isLogged, waitLoginPromise_1;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    session = 'session';
                    usingDeprecatedCreate = false;
                    if (typeof sessionOrOption === 'string' &&
                        sessionOrOption.replace(/\s/g, '').length) {
                        session = sessionOrOption.replace(/\s/g, '');
                        usingDeprecatedCreate =
                            typeof sessionOrOption === 'string' ||
                                typeof catchQR !== 'undefined' ||
                                typeof statusFind !== 'undefined' ||
                                typeof options !== 'undefined' ||
                                typeof browserSessionToken !== 'undefined';
                    }
                    else if (typeof sessionOrOption === 'object') {
                        options = sessionOrOption;
                        session = sessionOrOption.session;
                        catchQR = sessionOrOption.catchQR || catchQR;
                        statusFind = sessionOrOption.statusFind || statusFind;
                        if (!options.sessionToken) {
                            options.sessionToken =
                                sessionOrOption.browserSessionToken || browserSessionToken;
                        }
                    }
                    mergedOptions = __assign(__assign({}, create_config_1.defaultOptions), options);
                    logger = mergedOptions.logger;
                    if (usingDeprecatedCreate) {
                        logger.warn('You are using deprecated create method, please use create({options}) See: https://wppconnect-team.github.io/wppconnect/pages/Getting%20Started/creating-client.html#passing-options-on-create');
                    }
                    if (!mergedOptions.disableWelcome) {
                        welcome_1.welcomeScreen();
                    }
                    if (!mergedOptions.updatesLog) return [3 /*break*/, 2];
                    return [4 /*yield*/, welcome_1.checkUpdates()];
                case 1:
                    _a.sent();
                    _a.label = 2;
                case 2:
                    browser = mergedOptions.browser;
                    page = mergedOptions.page;
                    if (!(!browser && page)) return [3 /*break*/, 3];
                    // Get browser from page
                    browser = page.browser();
                    return [3 /*break*/, 5];
                case 3:
                    if (!(!browser && !page)) return [3 /*break*/, 5];
                    // Initialize new browser
                    logger.info('Initializing browser...', { session: session, type: 'browser' });
                    return [4 /*yield*/, browser_1.initBrowser(session, mergedOptions, logger).catch(function (e) {
                            if (mergedOptions.browserWS && mergedOptions.browserWS != '') {
                                logger.error("Error when try to connect " + mergedOptions.browserWS, {
                                    session: session,
                                    type: 'browser',
                                });
                            }
                            else {
                                logger.error("Error no open browser", {
                                    session: session,
                                    type: 'browser',
                                });
                            }
                            logger.error(e.message, {
                                session: session,
                                type: 'browser',
                            });
                            throw e;
                        })];
                case 4:
                    browser = _a.sent();
                    logger.http('checking headless...', {
                        session: session,
                        type: 'browser',
                    });
                    if (mergedOptions.headless) {
                        logger.http('headless option is active, browser hidden', {
                            session: session,
                            type: 'browser',
                        });
                    }
                    else {
                        logger.http('headless option is disabled, browser visible', {
                            session: session,
                            type: 'browser',
                        });
                    }
                    _a.label = 5;
                case 5:
                    if (!mergedOptions.browserWS && browser['_process']) {
                        browser['_process'].once('close', function () {
                            browser['isClose'] = true;
                        });
                    }
                    browser.on('targetdestroyed', function (target) { return __awaiter(_this, void 0, void 0, function () {
                        var pages;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (typeof browser.isConnected === 'function' &&
                                        !browser.isConnected()) {
                                        return [2 /*return*/];
                                    }
                                    return [4 /*yield*/, browser.pages()];
                                case 1:
                                    pages = _a.sent();
                                    if (!pages.length) {
                                        browser.close().catch(function () { return null; });
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); });
                    browser.on('disconnected', function () {
                        if (mergedOptions.browserWS) {
                            statusFind && statusFind('serverClose', session);
                        }
                        else {
                            statusFind && statusFind('browserClose', session);
                        }
                    });
                    if (!!page) return [3 /*break*/, 7];
                    return [4 /*yield*/, browser_1.getOrCreatePage(browser)];
                case 6:
                    // Initialize a page
                    page = _a.sent();
                    _a.label = 7;
                case 7:
                    if (!page) return [3 /*break*/, 10];
                    client_1 = new whatsapp_1.Whatsapp(page, session, mergedOptions);
                    if (!mergedOptions.waitForLogin) return [3 /*break*/, 9];
                    return [4 /*yield*/, client_1.waitForLogin(catchQR, statusFind)];
                case 8:
                    isLogged = _a.sent();
                    if (!isLogged) {
                        throw 'Not Logged';
                    }
                    waitLoginPromise_1 = null;
                    client_1.onStateChange(function (state) { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!(state === enum_1.SocketState.UNPAIRED ||
                                        state === enum_1.SocketState.UNPAIRED_IDLE)) return [3 /*break*/, 2];
                                    if (!waitLoginPromise_1) {
                                        waitLoginPromise_1 = client_1
                                            .waitForLogin(catchQR, statusFind)
                                            .catch(function () { })
                                            .finally(function () {
                                            waitLoginPromise_1 = null;
                                        });
                                    }
                                    return [4 /*yield*/, waitLoginPromise_1];
                                case 1:
                                    _a.sent();
                                    _a.label = 2;
                                case 2: return [2 /*return*/];
                            }
                        });
                    }); });
                    _a.label = 9;
                case 9: return [2 /*return*/, client_1];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.create = create;
