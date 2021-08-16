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
exports.SenderLayer = void 0;
var path = __importStar(require("path"));
var ffmpeg_1 = require("../../utils/ffmpeg");
var helpers_1 = require("../helpers");
var filename_from_mimetype_1 = require("../helpers/filename-from-mimetype");
var listener_layer_1 = require("./listener.layer");
var SenderLayer = /** @class */ (function (_super) {
    __extends(SenderLayer, _super);
    function SenderLayer(page, session, options) {
        var _this = _super.call(this, page, session, options) || this;
        _this.page = page;
        return _this;
    }
    /**
     * Automatically sends a link with the auto generated link preview. You can also add a custom message to be added.
     * @category Chat
     * @param chatId
     * @param url string A link, for example for youtube. e.g https://www.youtube.com/watch?v=Zi_XLOBDo_Y&list=RDEMe12_MlgO8mGFdeeftZ2nOQ&start_radio=1
     * @param title custom text as the message body, this includes the link or will be attached after the link
     */
    SenderLayer.prototype.sendLinkPreview = function (chatId, url, title) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var chatId = _a.chatId, url = _a.url, title = _a.title;
                            return WAPI.sendLinkPreview(chatId, url, title);
                        }, { chatId: chatId, url: url, title: title })];
                    case 1:
                        result = _a.sent();
                        if (result['erro'] == true) {
                            throw result;
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Sends a text message to given chat
     * @category Chat
     * @param to chat id: xxxxx@us.c
     * @param content text message
     */
    SenderLayer.prototype.sendText = function (to, content) {
        return __awaiter(this, void 0, void 0, function () {
            var messageId, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var to = _a.to, content = _a.content;
                            return WAPI.sendMessage(to, content);
                        }, { to: to, content: content })];
                    case 1:
                        messageId = _a.sent();
                        return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (messageId) { return WAPI.getMessageById(messageId); }, messageId)];
                    case 2:
                        result = (_a.sent());
                        if (result['erro'] == true) {
                            throw result;
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     *
     * @category Chat
     * @param chat
     * @param content
     * @param options
     * @returns
     */
    SenderLayer.prototype.sendMessageOptions = function (chat, content, options) {
        return __awaiter(this, void 0, void 0, function () {
            var messageId, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var chat = _a.chat, content = _a.content, options = _a.options;
                            return WAPI.sendMessageOptions(chat, content, options);
                        }, { chat: chat, content: content, options: options })];
                    case 1:
                        messageId = _a.sent();
                        return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (messageId) { return WAPI.getMessageById(messageId); }, messageId)];
                    case 2:
                        result = (_a.sent());
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Sends image message
     * @category Chat
     * @param to Chat id
     * @param filePath File path or http link
     * @param filename
     * @param caption
     */
    SenderLayer.prototype.sendImage = function (to, filePath, filename, caption) {
        return __awaiter(this, void 0, void 0, function () {
            var base64, obj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.downloadFileToBase64(filePath, [
                            'image/gif',
                            'image/png',
                            'image/jpg',
                            'image/jpeg',
                            'image/webp',
                        ])];
                    case 1:
                        base64 = _a.sent();
                        if (!!base64) return [3 /*break*/, 3];
                        return [4 /*yield*/, helpers_1.fileToBase64(filePath)];
                    case 2:
                        base64 = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!base64) {
                            obj = {
                                erro: true,
                                to: to,
                                text: 'No such file or directory, open "' + filePath + '"',
                            };
                            throw obj;
                        }
                        if (!filename) {
                            filename = path.basename(filePath);
                        }
                        return [4 /*yield*/, this.sendImageFromBase64(to, base64, filename, caption)];
                    case 4: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Sends image message
     * @category Chat
     * @param to Chat id
     * @param base64 File path, http link or base64Encoded
     * @param filename
     * @param caption
     */
    SenderLayer.prototype.sendImageFromBase64 = function (to, base64, filename, caption) {
        return __awaiter(this, void 0, void 0, function () {
            var mimeType, obj, obj, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mimeType = helpers_1.base64MimeType(base64);
                        if (!mimeType) {
                            obj = {
                                erro: true,
                                to: to,
                                text: 'Invalid base64!',
                            };
                            throw obj;
                        }
                        if (!mimeType.includes('image')) {
                            obj = {
                                erro: true,
                                to: to,
                                text: 'Not an image, allowed formats png, jpeg and webp',
                            };
                            throw obj;
                        }
                        filename = filename_from_mimetype_1.filenameFromMimeType(filename, mimeType);
                        return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                                var to = _a.to, base64 = _a.base64, filename = _a.filename, caption = _a.caption;
                                return WAPI.sendImage(base64, to, filename, caption);
                            }, { to: to, base64: base64, filename: filename, caption: caption })];
                    case 1:
                        result = _a.sent();
                        if (result['erro'] == true) {
                            throw result;
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Sends message with thumbnail
     * @category Chat
     * @param thumb
     * @param url
     * @param title
     * @param description
     * @param chatId
     */
    SenderLayer.prototype.sendMessageWithThumb = function (thumb, url, title, description, chatId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                        var thumb = _a.thumb, url = _a.url, title = _a.title, description = _a.description, chatId = _a.chatId;
                        WAPI.sendMessageWithThumb(thumb, url, title, description, chatId);
                    }, {
                        thumb: thumb,
                        url: url,
                        title: title,
                        description: description,
                        chatId: chatId,
                    })];
            });
        });
    };
    /**
     * Replies to given mesage id of given chat id
     * @category Chat
     * @param to Chat id
     * @param content Message body
     * @param quotedMsg Message id to reply to.
     */
    SenderLayer.prototype.reply = function (to, content, quotedMsg) {
        return __awaiter(this, void 0, void 0, function () {
            var messageId, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var to = _a.to, content = _a.content, quotedMsg = _a.quotedMsg;
                            return WAPI.reply(to, content, quotedMsg);
                        }, { to: to, content: content, quotedMsg: quotedMsg })];
                    case 1:
                        messageId = _a.sent();
                        return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (messageId) { return WAPI.getMessageById(messageId); }, messageId)];
                    case 2:
                        result = (_a.sent());
                        if (result['erro'] == true) {
                            throw result;
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Sends ptt audio
     * base64 parameter should have mime type already defined
     * @category Chat
     * @param to Chat id
     * @param base64 base64 data
     * @param filename
     * @param caption
     */
    SenderLayer.prototype.sendPttFromBase64 = function (to, base64, filename, caption) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                        var to = _a.to, base64 = _a.base64, filename = _a.filename, caption = _a.caption;
                        return WAPI.sendPtt(base64, to, filename, caption);
                    }, { to: to, base64: base64, filename: filename, caption: caption })];
            });
        });
    };
    /**
     * Sends ptt audio from path
     * @category Chat
     * @param to Chat id
     * @param filePath File path
     * @param filename
     * @param caption
     */
    SenderLayer.prototype.sendPtt = function (to, filePath, filename, caption) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var base64, obj;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.downloadFileToBase64(filePath, [/^audio/])];
                                case 1:
                                    base64 = _a.sent();
                                    if (!!base64) return [3 /*break*/, 3];
                                    return [4 /*yield*/, helpers_1.fileToBase64(filePath)];
                                case 2:
                                    base64 = _a.sent();
                                    _a.label = 3;
                                case 3:
                                    if (!base64) {
                                        obj = {
                                            erro: true,
                                            to: to,
                                            text: 'No such file or directory, open "' + filePath + '"',
                                        };
                                        return [2 /*return*/, reject(obj)];
                                    }
                                    if (!filename) {
                                        filename = path.basename(filePath);
                                    }
                                    return [2 /*return*/, this.sendPttFromBase64(to, base64, filename, caption)
                                            .then(resolve)
                                            .catch(reject)];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Sends file
     * base64 parameter should have mime type already defined
     * @category Chat
     * @param to Chat id
     * @param base64 base64 data
     * @param filename
     * @param caption
     */
    SenderLayer.prototype.sendFileFromBase64 = function (to, base64, filename, caption) {
        return __awaiter(this, void 0, void 0, function () {
            var mimeType, obj, type, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mimeType = helpers_1.base64MimeType(base64);
                        if (!mimeType) {
                            obj = {
                                erro: true,
                                to: to,
                                text: 'Invalid base64!',
                            };
                            throw obj;
                        }
                        filename = filename_from_mimetype_1.filenameFromMimeType(filename, mimeType);
                        type = 'FileFromBase64';
                        return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                                var to = _a.to, base64 = _a.base64, filename = _a.filename, caption = _a.caption, type = _a.type;
                                return WAPI.sendFile(base64, to, filename, caption, type);
                            }, { to: to, base64: base64, filename: filename, caption: caption, type: type })];
                    case 1:
                        result = _a.sent();
                        if (result['erro'] == true) {
                            throw result;
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Sends file from path
     * @category Chat
     * @param to Chat id
     * @param filePath File path
     * @param filename
     * @param caption
     */
    SenderLayer.prototype.sendFile = function (to, filePath, filename, caption) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var base64, obj;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, helpers_1.downloadFileToBase64(filePath)];
                                case 1:
                                    base64 = _a.sent();
                                    if (!!base64) return [3 /*break*/, 3];
                                    return [4 /*yield*/, helpers_1.fileToBase64(filePath)];
                                case 2:
                                    base64 = _a.sent();
                                    _a.label = 3;
                                case 3:
                                    if (!base64) {
                                        obj = {
                                            erro: true,
                                            to: to,
                                            text: 'No such file or directory, open "' + filePath + '"',
                                        };
                                        return [2 /*return*/, reject(obj)];
                                    }
                                    if (!filename) {
                                        filename = path.basename(filePath);
                                    }
                                    this.sendFileFromBase64(to, base64, filename, caption)
                                        .then(resolve)
                                        .catch(reject);
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Sends a video to given chat as a gif, with caption or not
     * @category Chat
     * @param to Chat id
     * @param filePath File path
     * @param filename
     * @param caption
     */
    SenderLayer.prototype.sendVideoAsGif = function (to, filePath, filename, caption) {
        return __awaiter(this, void 0, void 0, function () {
            var base64, obj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.downloadFileToBase64(filePath)];
                    case 1:
                        base64 = _a.sent();
                        if (!!base64) return [3 /*break*/, 3];
                        return [4 /*yield*/, helpers_1.fileToBase64(filePath)];
                    case 2:
                        base64 = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!base64) {
                            obj = {
                                erro: true,
                                to: to,
                                text: 'No such file or directory, open "' + filePath + '"',
                            };
                            throw obj;
                        }
                        if (!filename) {
                            filename = path.basename(filePath);
                        }
                        return [2 /*return*/, this.sendVideoAsGifFromBase64(to, base64, filename, caption)];
                }
            });
        });
    };
    /**
     * Sends a video to given chat as a gif, with caption or not, using base64
     * @category Chat
     * @param to chat id xxxxx@us.c
     * @param base64 base64 data:video/xxx;base64,xxx
     * @param filename string xxxxx
     * @param caption string xxxxx
     */
    SenderLayer.prototype.sendVideoAsGifFromBase64 = function (to, base64, filename, caption) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var to = _a.to, base64 = _a.base64, filename = _a.filename, caption = _a.caption;
                            return WAPI.sendVideoAsGif(base64, to, filename, caption);
                        }, { to: to, base64: base64, filename: filename, caption: caption })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Sends a video to given chat as a gif, with caption or not, using base64
     * @category Chat
     * @param to Chat id
     * @param filePath File path
     * @param filename
     * @param caption
     */
    SenderLayer.prototype.sendGif = function (to, filePath, filename, caption) {
        return __awaiter(this, void 0, void 0, function () {
            var base64, obj;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.downloadFileToBase64(filePath)];
                    case 1:
                        base64 = _a.sent();
                        if (!!base64) return [3 /*break*/, 3];
                        return [4 /*yield*/, helpers_1.fileToBase64(filePath)];
                    case 2:
                        base64 = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!base64) {
                            obj = {
                                erro: true,
                                to: to,
                                text: 'No such file or directory, open "' + filePath + '"',
                            };
                            throw obj;
                        }
                        if (!filename) {
                            filename = path.basename(filePath);
                        }
                        return [2 /*return*/, this.sendGifFromBase64(to, base64, filename, caption)];
                }
            });
        });
    };
    /**
     * Sends a video to given chat as a gif, with caption or not, using base64
     * @category Chat
     * @param to chat id xxxxx@us.c
     * @param base64 base64 data:video/xxx;base64,xxx
     * @param filename string xxxxx
     * @param caption string xxxxx
     */
    SenderLayer.prototype.sendGifFromBase64 = function (to, base64, filename, caption) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ffmpeg_1.convertToMP4GIF(base64)];
                    case 1:
                        base64 = _a.sent();
                        return [4 /*yield*/, this.sendVideoAsGifFromBase64(to, base64, filename, caption)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Sends contact card to iven chat id
     * @category Chat
     * @param to Chat id
     * @param contactsId Example: 0000@c.us | [000@c.us, 1111@c.us]
     */
    SenderLayer.prototype.sendContactVcard = function (to, contactsId, name) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var to = _a.to, contactsId = _a.contactsId, name = _a.name;
                            return WAPI.sendContactVcard(to, contactsId, name);
                        }, { to: to, contactsId: contactsId, name: name })];
                    case 1:
                        result = _a.sent();
                        if (result['erro'] == true) {
                            throw result;
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Send a list of contact cards
     * @category Chat
     * @param to Chat id
     * @param contacts Example: | ['000@c.us', '1111@c.us', {id: '2222@c.us', name: 'Test'}]
     */
    SenderLayer.prototype.sendContactVcardList = function (to, contacts) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var to = _a.to, contacts = _a.contacts;
                            return WAPI.sendContactVcardList(to, contacts);
                        }, { to: to, contacts: contacts })];
                    case 1:
                        result = _a.sent();
                        if (result['erro'] == true) {
                            throw result;
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * Forwards array of messages (could be ids or message objects)
     * @category Chat
     * @param to Chat id
     * @param messages Array of messages ids to be forwarded
     * @param skipMyMessages
     * @returns array of messages ID
     */
    SenderLayer.prototype.forwardMessages = function (to, messages, skipMyMessages) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                        var to = _a.to, messages = _a.messages, skipMyMessages = _a.skipMyMessages;
                        return WAPI.forwardMessages(to, messages, skipMyMessages);
                    }, { to: to, messages: messages, skipMyMessages: skipMyMessages })];
            });
        });
    };
    /**
     * Generates sticker from the provided animated gif image and sends it (Send image as animated sticker)
     * @category Chat
     *  @param path image path imageBase64 A valid gif image is required. You can also send via http/https (http://www.website.com/img.gif)
     *  @param to chatId '000000000000@c.us'
     */
    SenderLayer.prototype.sendImageAsStickerGif = function (to, path) {
        return __awaiter(this, void 0, void 0, function () {
            var b64, buff, mimeInfo, obj, _webb64, _met, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.downloadFileToBase64(path, ['image/gif', 'image/webp'])];
                    case 1:
                        b64 = _a.sent();
                        if (!!b64) return [3 /*break*/, 3];
                        return [4 /*yield*/, helpers_1.fileToBase64(path)];
                    case 2:
                        b64 = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!b64) return [3 /*break*/, 9];
                        buff = Buffer.from(b64.replace(/^data:image\/(gif|webp);base64,/, ''), 'base64');
                        mimeInfo = helpers_1.base64MimeType(b64);
                        if (!(!mimeInfo || mimeInfo.includes('image'))) return [3 /*break*/, 8];
                        return [4 /*yield*/, helpers_1.stickerSelect(buff, 1)];
                    case 4:
                        obj = _a.sent();
                        if (!(typeof obj == 'object')) return [3 /*break*/, 6];
                        _webb64 = obj['webpBase64'];
                        _met = obj['metadata'];
                        return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                                var _webb64 = _a._webb64, to = _a.to, _met = _a._met;
                                return WAPI.sendImageAsSticker(_webb64, to, _met, 'StickerGif');
                            }, { _webb64: _webb64, to: to, _met: _met })];
                    case 5:
                        result = _a.sent();
                        if (result['erro'] == true) {
                            throw result;
                        }
                        return [2 /*return*/, result];
                    case 6: throw {
                        error: true,
                        message: 'Error with sharp library, check the console log',
                    };
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        console.log('Not an image, allowed format gif');
                        return [2 /*return*/, false];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generates sticker from given image and sends it (Send Image As Sticker)
     * @category Chat
     * @param path image path imageBase64 A valid png, jpg and webp image is required. You can also send via http/https (http://www.website.com/img.gif)
     * @param to chatId '000000000000@c.us'
     */
    SenderLayer.prototype.sendImageAsSticker = function (to, path) {
        return __awaiter(this, void 0, void 0, function () {
            var b64, buff, mimeInfo, obj, _webb64, _met, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.downloadFileToBase64(path, [
                            'image/gif',
                            'image/png',
                            'image/jpg',
                            'image/jpeg',
                            'image/webp',
                        ])];
                    case 1:
                        b64 = _a.sent();
                        if (!!b64) return [3 /*break*/, 3];
                        return [4 /*yield*/, helpers_1.fileToBase64(path)];
                    case 2:
                        b64 = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!b64) return [3 /*break*/, 9];
                        buff = Buffer.from(b64.replace(/^data:image\/(png|jpe?g|webp|gif);base64,/, ''), 'base64');
                        mimeInfo = helpers_1.base64MimeType(b64);
                        if (!(!mimeInfo || mimeInfo.includes('image'))) return [3 /*break*/, 8];
                        return [4 /*yield*/, helpers_1.stickerSelect(buff, 0)];
                    case 4:
                        obj = _a.sent();
                        if (!(typeof obj == 'object')) return [3 /*break*/, 6];
                        _webb64 = obj['webpBase64'];
                        _met = obj['metadata'];
                        return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                                var _webb64 = _a._webb64, to = _a.to, _met = _a._met;
                                return WAPI.sendImageAsSticker(_webb64, to, _met, 'Sticker');
                            }, { _webb64: _webb64, to: to, _met: _met })];
                    case 5:
                        result = _a.sent();
                        if (result['erro'] == true) {
                            throw result;
                        }
                        return [2 /*return*/, result];
                    case 6: throw {
                        error: true,
                        message: 'Error with sharp library, check the console log',
                    };
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        console.log('Not an image, allowed formats png, jpeg and webp');
                        return [2 /*return*/, false];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * TODO: Fix message not being delivered
     * Sends location to given chat id
     * @category Chat
     * @param to Chat id
     * @param latitude Latitude
     * @param longitude Longitude
     * @param title Text caption
     */
    SenderLayer.prototype.sendLocation = function (to, latitude, longitude, title) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var to = _a.to, latitude = _a.latitude, longitude = _a.longitude, title = _a.title;
                            return WAPI.sendLocation(to, latitude, longitude, title);
                        }, { to: to, latitude: latitude, longitude: longitude, title: title })];
                    case 1:
                        result = _a.sent();
                        if (result['erro'] == true) {
                            throw result;
                        }
                        else {
                            return [2 /*return*/, result];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Sets a chat status to seen. Marks all messages as ack: 3
     * @category Chat
     * @param chatId chat id: xxxxx@us.c
     */
    SenderLayer.prototype.sendSeen = function (chatId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (chatId) { return WAPI.sendSeen(chatId); }, chatId)];
            });
        });
    };
    /**
     * Starts typing ('Typing...' state)
     * @category Chat
     * @param chatId
     */
    SenderLayer.prototype.startTyping = function (to) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                        var to = _a.to;
                        return WAPI.startTyping(to);
                    }, {
                        to: to,
                    })];
            });
        });
    };
    /**
     * Stops typing ('Typing...' state)
     * @category Chat
     * @param chatId
     */
    SenderLayer.prototype.stopTyping = function (to) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                        var to = _a.to;
                        return WAPI.stopTyping(to);
                    }, {
                        to: to,
                    })];
            });
        });
    };
    /**
     * Update your online presence
     * @category Chat
     * @param online true for available presence and false for unavailable
     */
    SenderLayer.prototype.setOnlinePresence = function (online) {
        if (online === void 0) { online = true; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                        var online = _a.online;
                        return WAPI.setOnlinePresence(online);
                    }, {
                        online: online,
                    })];
            });
        });
    };
    /**
     * Sends text with tags
     * @category Chat
     */
    SenderLayer.prototype.sendMentioned = function (to, message, mentioned) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var to = _a.to, message = _a.message, mentioned = _a.mentioned;
                            WAPI.sendMessageMentioned(to, message, mentioned);
                        }, { to: to, message: message, mentioned: mentioned })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Sets the chat state
     * @category Chat
     * @param chatState
     * @param chatId
     */
    SenderLayer.prototype.setChatState = function (chatId, chatState) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var chatState = _a.chatState, chatId = _a.chatId;
                            WAPI.sendChatstate(chatState, chatId);
                        }, { chatState: chatState, chatId: chatId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return SenderLayer;
}(listener_layer_1.ListenerLayer));
exports.SenderLayer = SenderLayer;
