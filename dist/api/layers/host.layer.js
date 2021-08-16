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
exports.HostLayer = void 0;
var create_config_1 = require("../../config/create-config");
var browser_1 = require("../../controllers/browser");
var helpers_1 = require("../helpers");
var auth_1 = require("../../controllers/auth");
var sleep_1 = require("../../utils/sleep");
var logger_1 = require("../../utils/logger");
var token_store_1 = require("../../token-store");
var HostLayer = /** @class */ (function () {
    function HostLayer(page, session, options) {
        this.page = page;
        this.autoCloseInterval = null;
        this.autoCloseCalled = false;
        this.statusFind = null;
        this.session = session;
        this.options = __assign(__assign({}, create_config_1.defaultOptions), options);
        this.logger = this.options.logger || logger_1.defaultLogger;
        if (typeof this.options.tokenStore === 'string') {
            switch (this.options.tokenStore) {
                case 'memory':
                    this.tokenStore = new token_store_1.MemoryTokenStore();
                    break;
                case 'file':
                default:
                    this.tokenStore = new token_store_1.FileTokenStore({
                        path: this.options.folderNameToken,
                    });
                    break;
            }
        }
        else {
            this.tokenStore = this.options.tokenStore;
        }
        if (!token_store_1.isValidTokenStore(this.tokenStore)) {
            this.log('warn', 'Invalid tokenStore, using default tokenStore', {
                type: 'tokenStore',
            });
            if (this.options.folderNameToken) {
                this.tokenStore = new token_store_1.FileTokenStore({
                    path: this.options.folderNameToken,
                });
            }
            else {
                this.tokenStore = new token_store_1.MemoryTokenStore();
            }
        }
        this.log('info', 'Initializing...');
        this.initialize();
    }
    HostLayer.prototype.log = function (level, message, meta) {
        if (meta === void 0) { meta = {}; }
        this.logger.log(__assign({ level: level, message: message, session: this.session, type: 'client' }, meta));
    };
    HostLayer.prototype.initialize = function () {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var sessionToken;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        sessionToken = this.options.sessionToken;
                        if (!!sessionToken) return [3 /*break*/, 2];
                        return [4 /*yield*/, Promise.resolve(this.tokenStore.getToken(this.session))];
                    case 1:
                        sessionToken = _c.sent();
                        _c.label = 2;
                    case 2:
                        if (token_store_1.isValidSessionToken(sessionToken)) {
                            this.log('verbose', 'Injecting session token', { type: 'token' });
                        }
                        return [4 /*yield*/, browser_1.initWhatsapp(this.page, sessionToken, !((_b = (_a = this.options) === null || _a === void 0 ? void 0 : _a.puppeteerOptions) === null || _b === void 0 ? void 0 : _b.userDataDir), this.options.whatsappVersion)];
                    case 3:
                        _c.sent();
                        this.page.on('load', function () {
                            _this.log('verbose', 'Page loaded', { type: 'page' });
                            _this.afterPageLoad();
                        });
                        this.page.on('close', function () {
                            _this.cancelAutoClose();
                            _this.log('verbose', 'Page Closed', { type: 'page' });
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    HostLayer.prototype.afterPageLoad = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log('verbose', 'Injecting wapi.js');
                        return [4 /*yield*/, browser_1.injectApi(this.page)
                                .then(function () {
                                _this.log('verbose', 'wapi.js injected');
                                _this.getWAVersion()
                                    .then(function (version) {
                                    _this.log('info', "WhatsApp WEB version: " + version);
                                })
                                    .catch(function () { return null; });
                            })
                                .catch(function (e) {
                                _this.log('verbose', 'wapi.js failed');
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    HostLayer.prototype.tryAutoClose = function () {
        if (this.autoCloseInterval) {
            this.cancelAutoClose();
        }
        if (this.options.autoClose > 0 &&
            !this.autoCloseInterval &&
            !this.page.isClosed()) {
            this.log('info', 'Closing the page');
            this.autoCloseCalled = true;
            this.statusFind && this.statusFind('autocloseCalled', this.session);
            try {
                this.page.close();
            }
            catch (error) { }
        }
    };
    HostLayer.prototype.startAutoClose = function () {
        var _this = this;
        if (this.options.autoClose > 0 && !this.autoCloseInterval) {
            var seconds = Math.round(this.options.autoClose / 1000);
            this.log('info', "Auto close configured to " + seconds + "s");
            var remain_1 = seconds;
            this.autoCloseInterval = setInterval(function () {
                if (_this.page.isClosed()) {
                    _this.cancelAutoClose();
                    return;
                }
                remain_1 -= 1;
                if (remain_1 % 10 === 0 || remain_1 <= 5) {
                    _this.log('http', "Auto close remain: " + remain_1 + "s");
                }
                if (remain_1 <= 0) {
                    _this.tryAutoClose();
                }
            }, 1000);
        }
    };
    HostLayer.prototype.cancelAutoClose = function () {
        clearInterval(this.autoCloseInterval);
        this.autoCloseInterval = null;
    };
    HostLayer.prototype.getQrCode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var qrResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.scrapeImg(this.page).catch(function () { return undefined; })];
                    case 1:
                        qrResult = _a.sent();
                        return [2 /*return*/, qrResult];
                }
            });
        });
    };
    HostLayer.prototype.waitForQrCodeScan = function (catchQR) {
        return __awaiter(this, void 0, void 0, function () {
            var urlCode, attempt, needsScan, result, qr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        urlCode = null;
                        attempt = 0;
                        _a.label = 1;
                    case 1:
                        if (!true) return [3 /*break*/, 8];
                        return [4 /*yield*/, auth_1.needsToScan(this.page).catch(function () { return null; })];
                    case 2:
                        needsScan = _a.sent();
                        if (!needsScan) {
                            return [3 /*break*/, 8];
                        }
                        return [4 /*yield*/, this.getQrCode()];
                    case 3:
                        result = _a.sent();
                        if (!((result === null || result === void 0 ? void 0 : result.urlCode) && urlCode !== result.urlCode)) return [3 /*break*/, 6];
                        urlCode = result.urlCode;
                        attempt++;
                        qr = '';
                        if (!(this.options.logQR || catchQR)) return [3 /*break*/, 5];
                        return [4 /*yield*/, auth_1.asciiQr(urlCode)];
                    case 4:
                        qr = _a.sent();
                        _a.label = 5;
                    case 5:
                        if (this.options.logQR) {
                            this.log('info', "Waiting for QRCode Scan (Attempt " + attempt + ")...:\n" + qr, { code: urlCode });
                        }
                        else {
                            this.log('verbose', "Waiting for QRCode Scan: Attempt " + attempt);
                        }
                        if (catchQR) {
                            catchQR(result.base64Image, qr, attempt, result.urlCode);
                        }
                        _a.label = 6;
                    case 6: return [4 /*yield*/, sleep_1.sleep(200)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 1];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    HostLayer.prototype.waitForInChat = function () {
        return __awaiter(this, void 0, void 0, function () {
            var inChat;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, auth_1.isInsideChat(this.page)];
                    case 1:
                        inChat = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(inChat === false)) return [3 /*break*/, 5];
                        return [4 /*yield*/, sleep_1.sleep(200)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, auth_1.isInsideChat(this.page)];
                    case 4:
                        inChat = _a.sent();
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, inChat];
                }
            });
        });
    };
    HostLayer.prototype.waitForPageLoad = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.page
                            .waitForFunction("!document.querySelector('#initial_startup')")
                            .catch(function () { })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, auth_1.getInterfaceStatus(this.page).catch(function () { return null; })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    HostLayer.prototype.waitForLogin = function (catchQR, statusFind) {
        return __awaiter(this, void 0, void 0, function () {
            var authenticated, inChat;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.statusFind = statusFind;
                        this.log('http', 'Waiting page load');
                        return [4 /*yield*/, this.waitForPageLoad()];
                    case 1:
                        _a.sent();
                        this.log('http', 'Checking is logged...');
                        return [4 /*yield*/, auth_1.isAuthenticated(this.page).catch(function () { return null; })];
                    case 2:
                        authenticated = _a.sent();
                        this.startAutoClose();
                        if (!(authenticated === false)) return [3 /*break*/, 6];
                        this.log('http', 'Waiting for QRCode Scan...');
                        statusFind && statusFind('notLogged', this.session);
                        return [4 /*yield*/, this.waitForQrCodeScan(catchQR)];
                    case 3:
                        _a.sent();
                        this.log('http', 'Checking QRCode status...');
                        // Wait for interface update
                        return [4 /*yield*/, sleep_1.sleep(200)];
                    case 4:
                        // Wait for interface update
                        _a.sent();
                        return [4 /*yield*/, auth_1.isAuthenticated(this.page).catch(function () { return null; })];
                    case 5:
                        authenticated = _a.sent();
                        if (authenticated === null) {
                            this.log('warn', 'Failed to authenticate');
                            statusFind && statusFind('qrReadError', this.session);
                        }
                        else if (authenticated) {
                            this.log('http', 'QRCode Success');
                            statusFind && statusFind('qrReadSuccess', this.session);
                        }
                        else {
                            this.log('warn', 'QRCode Fail');
                            statusFind && statusFind('qrReadFail', this.session);
                            this.tryAutoClose();
                            throw 'Failed to read the QRCode';
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        if (authenticated === true) {
                            this.log('http', 'Authenticated');
                            statusFind && statusFind('isLogged', this.session);
                        }
                        _a.label = 7;
                    case 7:
                        if (!(authenticated === true)) return [3 /*break*/, 10];
                        // Reinicia o contador do autoclose
                        this.cancelAutoClose();
                        this.startAutoClose();
                        // Wait for interface update
                        return [4 /*yield*/, sleep_1.sleep(200)];
                    case 8:
                        // Wait for interface update
                        _a.sent();
                        this.log('http', 'Checking phone is connected...');
                        return [4 /*yield*/, this.waitForInChat()];
                    case 9:
                        inChat = _a.sent();
                        if (!inChat) {
                            this.log('warn', 'Phone not connected');
                            statusFind && statusFind('phoneNotConnected', this.session);
                            this.tryAutoClose();
                            throw 'Phone not connected';
                        }
                        this.cancelAutoClose();
                        this.log('http', 'Connected');
                        statusFind && statusFind('inChat', this.session);
                        return [2 /*return*/, true];
                    case 10:
                        if (authenticated === false) {
                            this.tryAutoClose();
                            this.log('warn', 'Not logged');
                            throw 'Not logged';
                        }
                        this.tryAutoClose();
                        if (this.autoCloseCalled) {
                            this.log('error', 'Auto Close Called');
                            throw 'Auto Close Called';
                        }
                        if (this.page.isClosed()) {
                            this.log('error', 'Page Closed');
                            throw 'Page Closed';
                        }
                        this.log('error', 'Unknow error');
                        throw 'Unknow error';
                }
            });
        });
    };
    /**
     * Delete the Service Workers
     * @category Host
     */
    HostLayer.prototype.killServiceWorker = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.killServiceWorker(); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Load the service again
     * @category Host
     */
    HostLayer.prototype.restartService = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.restartService(); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * @category Host
     * @returns Current host device details
     */
    HostLayer.prototype.getHostDevice = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.getHost(); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieves WA version
     * @category Host
     */
    HostLayer.prototype.getWAVersion = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.getWAVersion(); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieves the connecction state
     * @category Host
     */
    HostLayer.prototype.getConnectionState = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () {
                            //@ts-ignore
                            return Store.State.default.state;
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieves if the phone is online. Please note that this may not be real time.
     * @category Host
     */
    HostLayer.prototype.isConnected = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.isConnected(); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieves if the phone is online. Please note that this may not be real time.
     * @category Host
     */
    HostLayer.prototype.isLoggedIn = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.isLoggedIn(); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieves Battery Level
     * @category Host
     */
    HostLayer.prototype.getBatteryLevel = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.getBatteryLevel(); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Start phone Watchdog, forcing the phone connection verification.
     *
     * @category Host
     * @param interval interval number in miliseconds
     */
    HostLayer.prototype.startPhoneWatchdog = function (interval) {
        if (interval === void 0) { interval = 15000; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (interval) { return WAPI.startPhoneWatchdog(interval); }, interval)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Stop phone Watchdog, more details in {@link startPhoneWatchdog}
     * @category Host
     */
    HostLayer.prototype.stopPhoneWatchdog = function (interval) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.stopPhoneWatchdog(); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return HostLayer;
}());
exports.HostLayer = HostLayer;
