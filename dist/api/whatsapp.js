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
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Whatsapp = void 0;
var business_layer_1 = require("./layers/business.layer");
var decrypt_1 = require("./helpers/decrypt");
var WAuserAgente_1 = require("../config/WAuserAgente");
var axios_1 = __importDefault(require("axios"));
var treekill = require("tree-kill");
var enum_1 = require("./model/enum");
var helpers_1 = require("./helpers");
var Whatsapp = /** @class */ (function (_super) {
    __extends(Whatsapp, _super);
    function Whatsapp(page, session, options) {
        var _this = _super.call(this, page, session, options) || this;
        _this.page = page;
        var connected = false;
        var removeToken = function () { return __awaiter(_this, void 0, void 0, function () {
            var removed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.log('info', 'Session Unpaired', { type: 'session' });
                        return [4 /*yield*/, Promise.resolve(this.tokenStore.removeToken(this.session))];
                    case 1:
                        removed = _a.sent();
                        if (removed) {
                            this.log('verbose', 'Token removed', { type: 'token' });
                        }
                        return [2 /*return*/];
                }
            });
        }); };
        if (_this.page) {
            _this.page.on('close', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            if (!!connected) return [3 /*break*/, 2];
                            return [4 /*yield*/, removeToken()];
                        case 1:
                            _a.sent();
                            _a.label = 2;
                        case 2: return [2 /*return*/];
                    }
                });
            }); });
        }
        _this.onStateChange(function (state) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (state) {
                    case enum_1.SocketState.CONNECTED:
                        connected = true;
                        // wait for localStore populate
                        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            var tokenData, updated;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        this.log('verbose', 'Updating session token', { type: 'token' });
                                        return [4 /*yield*/, this.getSessionTokenBrowser()];
                                    case 1:
                                        tokenData = _a.sent();
                                        return [4 /*yield*/, Promise.resolve(this.tokenStore.setToken(this.session, tokenData))];
                                    case 2:
                                        updated = _a.sent();
                                        if (updated) {
                                            this.log('verbose', 'Session token updated', {
                                                type: 'token',
                                            });
                                        }
                                        else {
                                            this.log('warn', 'Failed to update session token', {
                                                type: 'token',
                                            });
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        }); }, 1000);
                        break;
                    case enum_1.SocketState.UNPAIRED:
                    case enum_1.SocketState.UNPAIRED_IDLE:
                        setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, removeToken()];
                                    case 1:
                                        _a.sent();
                                        // Fire only after a success connection and disconnection
                                        if (connected && this.statusFind) {
                                            try {
                                                this.statusFind('desconnectedMobile', session);
                                            }
                                            catch (error) { }
                                        }
                                        connected = false;
                                        return [2 /*return*/];
                                }
                            });
                        }); }, 1000);
                        break;
                }
                return [2 /*return*/];
            });
        }); });
        return _this;
    }
    /**
     * Decrypts message file
     * @param data Message object
     * @returns Decrypted file buffer (null otherwise)
     */
    Whatsapp.prototype.downloadFile = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (data) { return WAPI.downloadFile(data); }, data)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Download and returns the media content in base64 format
     * @param messageId Message ou id
     * @returns Base64 of media
     */
    Whatsapp.prototype.downloadMedia = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof messageId !== 'string') {
                            messageId = messageId.id;
                        }
                        return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (messageId) {
                                return WAPI.downloadMedia(messageId).catch(function (e) { return ({
                                    __error: e,
                                }); });
                            }, messageId)];
                    case 1:
                        result = _a.sent();
                        if (typeof result == 'object' && '__error' in result) {
                            throw result.__error;
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    Object.defineProperty(Whatsapp.prototype, "waPage", {
        /**
         * Get the puppeteer page instance
         * @returns The Whatsapp page
         */
        get: function () {
            return this.page;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Clicks on 'use here' button (When it get unlaunched)
     * This method tracks the class of the button
     * Whatsapp web might change this class name over the time
     * Dont rely on this method
     */
    Whatsapp.prototype.useHere = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.takeOver(); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Logout whastapp
     * @returns boolean
     */
    Whatsapp.prototype.logout = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.logout(); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Closes page and browser
     * @internal
     */
    Whatsapp.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            var closing, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        closing = function (waPage) { return __awaiter(_this, void 0, void 0, function () {
                            var browser, pid;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!waPage) return [3 /*break*/, 6];
                                        return [4 /*yield*/, waPage.browser()];
                                    case 1:
                                        browser = _a.sent();
                                        pid = browser.process() ? browser === null || browser === void 0 ? void 0 : browser.process().pid : null;
                                        if (!!waPage.isClosed()) return [3 /*break*/, 3];
                                        return [4 /*yield*/, waPage.close()];
                                    case 2:
                                        _a.sent();
                                        _a.label = 3;
                                    case 3:
                                        if (!browser) return [3 /*break*/, 5];
                                        return [4 /*yield*/, browser.close()];
                                    case 4:
                                        _a.sent();
                                        _a.label = 5;
                                    case 5:
                                        if (pid)
                                            treekill(pid, 'SIGKILL');
                                        _a.label = 6;
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, closing(this.page)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * Get message by id
     * @param messageId string
     * @returns Message object
     */
    Whatsapp.prototype.getMessageById = function (messageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (messageId) { return WAPI.getMessageById(messageId); }, messageId)];
                    case 1: return [2 /*return*/, (_a.sent())];
                }
            });
        });
    };
    /**
     * Retorna uma lista de mensagens de um chat
     * @param chatId string ID da conversa ou do grupo
     * @param params GetMessagesParam Opções de filtragem de resultados (count, id, direction) veja {@link GetMessagesParam}.
     * @returns Message object
     */
    Whatsapp.prototype.getMessages = function (chatId, params) {
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var chatId = _a.chatId, params = _a.params;
                            return WAPI.getMessages(chatId, params);
                        }, { chatId: chatId, params: params })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Decrypts message file
     * @param message Message object
     * @returns Decrypted file buffer (null otherwise)
     */
    Whatsapp.prototype.decryptFile = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var mediaUrl, options, haventGottenImageYet, res, error_2, buff;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mediaUrl = message.clientUrl || message.deprecatedMms3Url;
                        options = decrypt_1.makeOptions(WAuserAgente_1.useragentOverride);
                        if (!mediaUrl)
                            throw new Error('message is missing critical data needed to download the file.');
                        haventGottenImageYet = true;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        _a.label = 2;
                    case 2:
                        if (!haventGottenImageYet) return [3 /*break*/, 7];
                        return [4 /*yield*/, axios_1.default.get(mediaUrl.trim(), options)];
                    case 3:
                        res = _a.sent();
                        if (!(res.status == 200)) return [3 /*break*/, 4];
                        haventGottenImageYet = false;
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, decrypt_1.timeout(2000)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [3 /*break*/, 2];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_2 = _a.sent();
                        throw 'Error trying to download the file.';
                    case 9:
                        buff = Buffer.from(res.data, 'binary');
                        return [2 /*return*/, decrypt_1.magix(buff, message.mediaKey, message.type, message.size)];
                }
            });
        });
    };
    /**
     * Rejeita uma ligação recebida pelo WhatsApp
     * @param callId string ID da ligação, caso não passado, todas ligações serão rejeitadas
     * @returns Número de ligações rejeitadas
     */
    Whatsapp.prototype.rejectCall = function (callId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var callId = _a.callId;
                            return WAPI.rejectCall(callId);
                        }, {
                            callId: callId,
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Whatsapp;
}(business_layer_1.BusinessLayer));
exports.Whatsapp = Whatsapp;
