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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.injectSessionToken = exports.asciiQr = exports.isConnectingToPhone = exports.isInsideChat = exports.needsToScan = exports.isAuthenticated = exports.getInterfaceStatus = void 0;
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var qrcode = __importStar(require("qrcode-terminal"));
var puppeteer_config_1 = require("../config/puppeteer.config");
var token_store_1 = require("../token-store");
var getInterfaceStatus = function (waPage) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, waPage
                    .waitForFunction(function () {
                    var elLoginWrapper = document.querySelector('body > div > div > .landing-wrapper');
                    var elQRCodeCanvas = document.querySelector('canvas');
                    if (elLoginWrapper && elQRCodeCanvas) {
                        return 'UNPAIRED';
                    }
                    var streamStatus = window['Store'] &&
                        window['Store'].Stream &&
                        window['Store'].Stream.displayInfo;
                    if (['PAIRING', 'RESUMING', 'SYNCING'].includes(streamStatus)) {
                        return 'PAIRING';
                    }
                    var elChat = document.querySelector('.app,.two');
                    if (elChat && elChat.attributes && elChat.tabIndex) {
                        return 'CONNECTED';
                    }
                    return false;
                }, {
                    timeout: 0,
                    polling: 100,
                })
                    .then(function (element) { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, element.evaluate(function (a) { return a; })];
                            case 1: return [2 /*return*/, (_a.sent())];
                        }
                    });
                }); })
                    .catch(function () { return null; })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.getInterfaceStatus = getInterfaceStatus;
/**
 * Validates if client is authenticated
 * @returns true if is authenticated, false otherwise
 * @param waPage
 */
var isAuthenticated = function (waPage) { return __awaiter(void 0, void 0, void 0, function () {
    var status;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getInterfaceStatus(waPage)];
            case 1:
                status = _a.sent();
                if (typeof status !== 'string') {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, ['CONNECTED', 'PAIRING'].includes(status)];
        }
    });
}); };
exports.isAuthenticated = isAuthenticated;
var needsToScan = function (waPage) { return __awaiter(void 0, void 0, void 0, function () {
    var status;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getInterfaceStatus(waPage)];
            case 1:
                status = _a.sent();
                if (typeof status !== 'string') {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, status === 'UNPAIRED'];
        }
    });
}); };
exports.needsToScan = needsToScan;
var isInsideChat = function (waPage) { return __awaiter(void 0, void 0, void 0, function () {
    var status;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getInterfaceStatus(waPage)];
            case 1:
                status = _a.sent();
                if (typeof status !== 'string') {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, status === 'CONNECTED'];
        }
    });
}); };
exports.isInsideChat = isInsideChat;
var isConnectingToPhone = function (waPage) { return __awaiter(void 0, void 0, void 0, function () {
    var status;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, exports.getInterfaceStatus(waPage)];
            case 1:
                status = _a.sent();
                if (typeof status !== 'string') {
                    return [2 /*return*/, null];
                }
                return [2 /*return*/, status === 'PAIRING'];
        }
    });
}); };
exports.isConnectingToPhone = isConnectingToPhone;
function asciiQr(code) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    qrcode.generate(code, { small: true }, function (qrcode) {
                        resolve(qrcode);
                    });
                })];
        });
    });
}
exports.asciiQr = asciiQr;
function injectSessionToken(page, token, clear) {
    if (clear === void 0) { clear = true; }
    return __awaiter(this, void 0, void 0, function () {
        var reqHandler;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!token || !token_store_1.isValidSessionToken(token)) {
                        token = {};
                    }
                    return [4 /*yield*/, page.setRequestInterception(true)];
                case 1:
                    _a.sent();
                    reqHandler = function (req) {
                        if (req.url().endsWith('wppconnect-banner.jpeg')) {
                            req.respond({
                                body: fs.readFileSync(path.resolve(__dirname + '/../../img/wppconnect-banner.jpeg')),
                                contentType: 'image/jpeg',
                            });
                            return;
                        }
                        if (req.resourceType() !== 'document') {
                            req.continue();
                            return;
                        }
                        req.respond({
                            status: 200,
                            contentType: 'text/html',
                            body: "\n<!doctype html>\n<html lang=en>\n  <head>\n    <title>Initializing WhatsApp</title>\n    <style>\n      body {\n        height: 100vh;\n        display: flex;\n        align-items: center;\n        justify-content: center;\n        font-family: arial, sans-serif;\n        background-color: #e6e6e6;\n      }\n      img {\n        display: block;\n        max-width: 100%;\n        max-height:100%;\n      }\n      h1 {\n        text-align: center;\n      }\n    </style>\n  </head>\n  <body>\n    <div>\n      <img src=\"wppconnect-banner.jpeg\" />\n      <h1>Initializing WhatsApp ...</h1>\n    </div>\n  </body>\n</html>",
                        });
                    };
                    page.on('request', reqHandler);
                    return [4 /*yield*/, page.goto(puppeteer_config_1.puppeteerConfig.whatsappUrl)];
                case 2:
                    _a.sent();
                    if (!clear) return [3 /*break*/, 4];
                    return [4 /*yield*/, page.evaluate(function (session) {
                            localStorage.clear();
                        })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [4 /*yield*/, page.evaluate(function (session) {
                        Object.keys(session).forEach(function (key) {
                            localStorage.setItem(key, session[key]);
                        });
                    }, token)];
                case 5:
                    _a.sent();
                    // Disable
                    page.off('request', reqHandler);
                    return [4 /*yield*/, page.setRequestInterception(false)];
                case 6:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
exports.injectSessionToken = injectSessionToken;
