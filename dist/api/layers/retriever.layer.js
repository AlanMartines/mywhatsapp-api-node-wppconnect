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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetrieverLayer = void 0;
var helpers_1 = require("../helpers");
var sender_layer_1 = require("./sender.layer");
var RetrieverLayer = /** @class */ (function (_super) {
    __extends(RetrieverLayer, _super);
    function RetrieverLayer(page, session, options) {
        var _this = _super.call(this, page, session, options) || this;
        _this.page = page;
        return _this;
    }
    /**
     * Returns a list of mute and non-mute users
     * @category Chat
     * @param type return type: all, toMute and noMute.
     * @returns obj
     */
    RetrieverLayer.prototype.getListMutes = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (type) { return WAPI.getListMute(type); }, type)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Returns browser session token
     * @category Host
     * @returns obj [token]
     */
    RetrieverLayer.prototype.getSessionTokenBrowser = function (removePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(removePath === true)) return [3 /*break*/, 2];
                        return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () {
                                window['pathSession'] = true;
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.page
                            .evaluate(function () {
                            if (window.localStorage) {
                                return {
                                    WABrowserId: window.localStorage.getItem('WABrowserId'),
                                    WASecretBundle: window.localStorage.getItem('WASecretBundle'),
                                    WAToken1: window.localStorage.getItem('WAToken1'),
                                    WAToken2: window.localStorage.getItem('WAToken2'),
                                };
                            }
                            return null;
                        })
                            .catch(function () { return null; })];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Receive the current theme
     * @category Host
     * @returns string light or dark
     */
    RetrieverLayer.prototype.getTheme = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.getTheme(); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Receive all blocked contacts
     * @category Blocklist
     * @returns array of [0,1,2,3....]
     */
    RetrieverLayer.prototype.getBlockList = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.getBlockList(); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieves all chats
     * @category Chat
     * @returns array of [Chat]
     */
    RetrieverLayer.prototype.getAllChats = function (withNewMessageOnly) {
        if (withNewMessageOnly === void 0) { withNewMessageOnly = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (withNewMessageOnly) {
                    return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.getAllChatsWithNewMsg(); })];
                }
                else {
                    return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.getAllChats(); })];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Checks if a number is a valid WA number
     * @category Contact
     * @param contactId, you need to include the @c.us at the end.
     * @returns contact detial as promise
     */
    RetrieverLayer.prototype.checkNumberStatus = function (contactId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (contactId) { return WAPI.checkNumberStatus(contactId); }, contactId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieves all chats with messages
     * @category Chat
     * @returns array of [Chat]
     */
    RetrieverLayer.prototype.getAllChatsWithMessages = function (withNewMessageOnly) {
        if (withNewMessageOnly === void 0) { withNewMessageOnly = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (withNewMessageOnly) {
                        return WAPI.getAllChatsWithMessages(withNewMessageOnly);
                    }, withNewMessageOnly)];
            });
        });
    };
    /**
     * Retrieve all groups
     * @category Group
     * @returns array of groups
     */
    RetrieverLayer.prototype.getAllGroups = function (withNewMessagesOnly) {
        if (withNewMessagesOnly === void 0) { withNewMessagesOnly = false; }
        return __awaiter(this, void 0, void 0, function () {
            var chats, chats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!withNewMessagesOnly) return [3 /*break*/, 2];
                        return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.getAllChatsWithNewMsg(); })];
                    case 1:
                        chats = _a.sent();
                        return [2 /*return*/, chats.filter(function (chat) { return chat.isGroup; })];
                    case 2: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () {
                            return WAPI.getAllChats();
                        })];
                    case 3:
                        chats = _a.sent();
                        return [2 /*return*/, chats.filter(function (chat) { return chat.isGroup; })];
                }
            });
        });
    };
    /**
     * Retrieve all broadcast list
     * @category Group
     * @returns array of broadcast list
     */
    RetrieverLayer.prototype.getAllBroadcastList = function () {
        return __awaiter(this, void 0, void 0, function () {
            var chats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.getAllChats(); })];
                    case 1:
                        chats = _a.sent();
                        return [2 /*return*/, chats.filter(function (chat) { return chat.isBroadcast && chat.id._serialized !== 'status@broadcast'; })];
                }
            });
        });
    };
    /**
     * Retrieves contact detail object of given contact id
     * @category Contact
     * @param contactId
     * @returns contact detial as promise
     */
    RetrieverLayer.prototype.getContact = function (contactId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (contactId) { return WAPI.getContact(contactId); }, contactId)];
            });
        });
    };
    /**
     * Retrieves all contacts
     * @category Contact
     * @returns array of [Contact]
     */
    RetrieverLayer.prototype.getAllContacts = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.getAllContacts(); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieves chat object of given contact id
     * @category Chat
     * @param contactId
     * @returns contact detial as promise
     */
    RetrieverLayer.prototype.getChatById = function (contactId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (contactId) { return WAPI.getChatById(contactId); }, contactId)];
            });
        });
    };
    /**
     * Retrieves chat object of given contact id
     * @category Chat
     * @param contactId
     * @returns contact detial as promise
     * @deprecated
     */
    RetrieverLayer.prototype.getChat = function (contactId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getChatById(contactId)];
            });
        });
    };
    /**
     * Retorna dados da imagem do contato
     * @category Contact
     * @param chatId Chat id
     * @returns url of the chat picture or undefined if there is no picture for the chat.
     */
    RetrieverLayer.prototype.getProfilePicFromServer = function (chatId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (chatId) { return WAPI._profilePicfunc(chatId); }, chatId)];
            });
        });
    };
    /**
     * Load more messages in chat object from server. Use this in a while loop
     * Depreciado em favor de {@link getMessages}
     *
     * @deprecated Depreciado em favor de getMessages
     * @category Chat
     * @param contactId
     * @returns contact detial as promise
     */
    RetrieverLayer.prototype.loadEarlierMessages = function (contactId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (contactId) { return WAPI.loadEarlierMessages(contactId); }, contactId)];
            });
        });
    };
    /**
     * Retrieves status of given contact
     * @category Contact
     * @param contactId
     */
    RetrieverLayer.prototype.getStatus = function (contactId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (contactId) { return WAPI.getStatus(contactId); }, contactId)];
            });
        });
    };
    /**
     * Checks if a number is a valid whatsapp number
     * @category Contact
     * @param contactId, you need to include the @c.us at the end.
     * @returns contact detial as promise
     */
    RetrieverLayer.prototype.getNumberProfile = function (contactId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (contactId) { return WAPI.getNumberProfile(contactId); }, contactId)];
            });
        });
    };
    /**
     * Retrieves all undread Messages
     * @category Chat
     * @param includeMe
     * @param includeNotifications
     * @param useUnreadCount
     * @returns any
     * @deprecated
     */
    RetrieverLayer.prototype.getUnreadMessages = function (includeMe, includeNotifications, useUnreadCount) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var includeMe = _a.includeMe, includeNotifications = _a.includeNotifications, useUnreadCount = _a.useUnreadCount;
                            return WAPI.getUnreadMessages(includeMe, includeNotifications, useUnreadCount);
                        }, { includeMe: includeMe, includeNotifications: includeNotifications, useUnreadCount: useUnreadCount })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieves all unread messages (where ack is -1)
     * @category Chat
     * @returns list of messages
     */
    RetrieverLayer.prototype.getAllUnreadMessages = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.getAllUnreadMessages(); })];
            });
        });
    };
    /**
     * Retrieves all new messages (where isNewMsg is true)
     * @category Chat
     * @returns List of messages
     * @deprecated Use getAllUnreadMessages
     */
    RetrieverLayer.prototype.getAllNewMessages = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function () { return WAPI.getAllNewMessages(); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieves all messages already loaded in a chat
     * For loading every message use loadAndGetAllMessagesInChat
     * Depreciado em favor de {@link getMessages}
     *
     * @deprecated Depreciado em favor de getMessages
     *
     * @category Chat
     * @param chatId, the chat to get the messages from
     * @param includeMe, include my own messages? boolean
     * @param includeNotifications
     * @returns any
     */
    RetrieverLayer.prototype.getAllMessagesInChat = function (chatId, includeMe, includeNotifications) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var chatId = _a.chatId, includeMe = _a.includeMe, includeNotifications = _a.includeNotifications;
                            return WAPI.getAllMessagesInChat(chatId, includeMe, includeNotifications);
                        }, { chatId: chatId, includeMe: includeMe, includeNotifications: includeNotifications })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Loads and Retrieves all Messages in a chat
     * Depreciado em favor de {@link getMessages}
     *
     * @deprecated Depreciado em favor de getMessages
     * @category Chat
     * @param chatId, the chat to get the messages from
     * @param includeMe, include my own messages? boolean
     * @param includeNotifications
     * @returns any
     */
    RetrieverLayer.prototype.loadAndGetAllMessagesInChat = function (chatId, includeMe, includeNotifications) {
        if (includeMe === void 0) { includeMe = false; }
        if (includeNotifications === void 0) { includeNotifications = false; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var chatId = _a.chatId, includeMe = _a.includeMe, includeNotifications = _a.includeNotifications;
                            return WAPI.loadAndGetAllMessagesInChat(chatId, includeMe, includeNotifications);
                        }, { chatId: chatId, includeMe: includeMe, includeNotifications: includeNotifications })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Checks if a CHAT contact is online.
     * @category Chat
     * @param chatId chat id: xxxxx@c.us
     */
    RetrieverLayer.prototype.getChatIsOnline = function (chatId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (chatId) { return WAPI.getChatIsOnline(chatId); }, chatId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieves the last seen of a CHAT.
     * @category Chat
     * @param chatId chat id: xxxxx@c.us
     */
    RetrieverLayer.prototype.getLastSeen = function (chatId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (chatId) { return WAPI.getLastSeen(chatId); }, chatId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return RetrieverLayer;
}(sender_layer_1.SenderLayer));
exports.RetrieverLayer = RetrieverLayer;
