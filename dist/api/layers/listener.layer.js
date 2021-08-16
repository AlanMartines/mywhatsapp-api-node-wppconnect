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
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenerLayer = void 0;
var events_1 = require("events");
var helpers_1 = require("../helpers");
var exposed_enum_1 = require("../helpers/exposed.enum");
var enum_1 = require("../model/enum");
var profile_layer_1 = require("./profile.layer");
var ListenerLayer = /** @class */ (function (_super) {
    __extends(ListenerLayer, _super);
    function ListenerLayer(page, session, options) {
        var _this = _super.call(this, page, session, options) || this;
        _this.page = page;
        _this.listenerEmitter = new events_1.EventEmitter();
        _this.listenerEmitter.on(exposed_enum_1.ExposedFn.onInterfaceChange, function (state) {
            _this.log('http', "Current state: " + state.mode + " (" + state.displayInfo + ")");
        });
        return _this;
    }
    ListenerLayer.prototype.afterPageLoad = function () {
        return __awaiter(this, void 0, void 0, function () {
            var functions, _loop_1, this_1, _i, functions_1, func;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.afterPageLoad.call(this)];
                    case 1:
                        _a.sent();
                        functions = __spreadArray(__spreadArray([], Object.values(exposed_enum_1.ExposedFn)), [
                            'onAddedToGroup',
                            'onIncomingCall',
                        ]);
                        _loop_1 = function (func) {
                            var has;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, this_1.page
                                            .evaluate(function (func) { return typeof window[func] === 'function'; }, func)
                                            .catch(function () { return false; })];
                                    case 1:
                                        has = _b.sent();
                                        if (!!has) return [3 /*break*/, 3];
                                        this_1.log('debug', "Exposing " + func + " function");
                                        return [4 /*yield*/, this_1.page
                                                .exposeFunction(func, function () {
                                                var _a;
                                                var args = [];
                                                for (var _i = 0; _i < arguments.length; _i++) {
                                                    args[_i] = arguments[_i];
                                                }
                                                return (_a = _this.listenerEmitter).emit.apply(_a, __spreadArray([func], args));
                                            })
                                                .catch(function () { })];
                                    case 2:
                                        _b.sent();
                                        _b.label = 3;
                                    case 3: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, functions_1 = functions;
                        _a.label = 2;
                    case 2:
                        if (!(_i < functions_1.length)) return [3 /*break*/, 5];
                        func = functions_1[_i];
                        return [5 /*yield**/, _loop_1(func)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, this.page
                            .evaluate(function () {
                            if (!window['onMessage'].exposed) {
                                window.WAPI.waitNewMessages(false, function (data) {
                                    data.forEach(function (message) {
                                        window['onMessage'](message);
                                    });
                                });
                                window['onMessage'].exposed = true;
                            }
                            if (!window['onAck'].exposed) {
                                window.WAPI.waitNewAcknowledgements(window['onAck']);
                                window['onAck'].exposed = true;
                            }
                            if (!window['onAnyMessage'].exposed) {
                                window.WAPI.allNewMessagesListener(window['onAnyMessage']);
                                window['onAnyMessage'].exposed = true;
                            }
                            if (!window['onStateChange'].exposed) {
                                window.WAPI.onStateChange(window['onStateChange']);
                                window['onStateChange'].exposed = true;
                            }
                            if (!window['onStreamChange'].exposed) {
                                window.WAPI.onStreamChange(window['onStreamChange']);
                                window['onStreamChange'].exposed = true;
                            }
                            if (!window['onAddedToGroup'].exposed) {
                                window.WAPI.onAddedToGroup(window['onAddedToGroup']);
                                window['onAddedToGroup'].exposed = true;
                            }
                            if (!window['onIncomingCall'].exposed) {
                                window.WAPI.onIncomingCall(window['onIncomingCall']);
                                window['onIncomingCall'].exposed = true;
                            }
                            if (!window['onInterfaceChange'].exposed) {
                                window.WAPI.onInterfaceChange(window['onInterfaceChange']);
                                window['onInterfaceChange'].exposed = true;
                            }
                            if (!window['onNotificationMessage'].exposed) {
                                window.WAPI.onNotificationMessage(window['onNotificationMessage']);
                                window['onNotificationMessage'].exposed = true;
                            }
                            if (!window['onPresenceChanged'].exposed) {
                                window.WAPI.onPresenceChanged(window['onPresenceChanged']);
                                window['onPresenceChanged'].exposed = true;
                            }
                            if (!window['onLiveLocation'].exposed) {
                                window.WAPI.onLiveLocation(window['onLiveLocation']);
                                window['onLiveLocation'].exposed = true;
                            }
                        })
                            .catch(function () { })];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Register the event and create a disposable object to stop the listening
     * @param event Name of event
     * @param listener The function to execute
     * @returns Disposable object to stop the listening
     */
    ListenerLayer.prototype.registerEvent = function (event, listener) {
        var _this = this;
        this.listenerEmitter.on(event, listener);
        return {
            dispose: function () {
                _this.listenerEmitter.off(event, listener);
            },
        };
    };
    /**
     * @event Listens to all new messages received only.
     * @returns Disposable object to stop the listening
     */
    ListenerLayer.prototype.onMessage = function (callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.OnMessage, callback);
    };
    /**
     * @event Listens to all new messages, sent and received.
     * @param to callback
     * @fires Message
     * @returns Disposable object to stop the listening
     */
    ListenerLayer.prototype.onAnyMessage = function (callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.OnAnyMessage, callback);
    };
    /**
     * @event Listens to all notification messages, like group changes, join, leave
     * @param to callback
     * @fires Message
     * @returns Disposable object to stop the listening
     */
    ListenerLayer.prototype.onNotificationMessage = function (callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.onNotificationMessage, callback);
    };
    /**
     * @event Listens List of mobile states
     * @returns Disposable object to stop the listening
     */
    ListenerLayer.prototype.onStateChange = function (callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.onStateChange, callback);
    };
    /**
     * @event Returns the current state of the connection
     * @returns Disposable object to stop the listening
     */
    ListenerLayer.prototype.onStreamChange = function (callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.onStreamChange, callback);
    };
    /**
     * @event Listens to interface mode change See {@link InterfaceState} and {@link InterfaceMode} for details
     * @returns Disposable object to stop the listening
     */
    ListenerLayer.prototype.onInterfaceChange = function (callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.onInterfaceChange, callback);
    };
    /**
     * @event Listens to messages acknowledgement Changes
     * @returns Disposable object to stop the listening
     */
    ListenerLayer.prototype.onAck = function (callback) {
        return this.registerEvent(exposed_enum_1.ExposedFn.onAck, callback);
    };
    ListenerLayer.prototype.onLiveLocation = function (id, callback) {
        var ids = [];
        if (typeof id === 'function') {
            callback = id;
        }
        else if (Array.isArray(id)) {
            ids.push.apply(ids, id);
        }
        else {
            ids.push(id);
        }
        return this.registerEvent(exposed_enum_1.ExposedFn.onLiveLocation, function (event) {
            // Only group events
            if (ids.length && !ids.includes(event.id)) {
                return;
            }
            callback(event);
        });
    };
    ListenerLayer.prototype.onParticipantsChanged = function (groupId, callback) {
        if (typeof groupId === 'function') {
            callback = groupId;
            groupId = null;
        }
        var subtypeEvents = ['invite', 'add', 'remove', 'leave'];
        return this.registerEvent(exposed_enum_1.ExposedFn.onNotificationMessage, function (message) {
            // Only group events
            if (message.type !== enum_1.MessageType.GP2 ||
                !subtypeEvents.includes(message.subtype)) {
                return;
            }
            if (groupId && groupId !== message.id) {
                return;
            }
            callback({
                by: message.from,
                groupId: message.chatId,
                action: message.subtype,
                who: message.recipients,
            });
        });
    };
    /**
     * @event Fires callback with Chat object every time the host phone is added to a group.
     * @param to callback
     * @returns Disposable object to stop the listening
     */
    ListenerLayer.prototype.onAddedToGroup = function (callback) {
        return this.registerEvent('onAddedToGroup', callback);
    };
    /**
     * @event Escuta por ligações recebidas, seja de áudio ou vídeo.
     *
     * Para recusar a ligação, basta chamar o `rejectCall` {@link rejectCall}
     *
     * @returns Objeto descartável para parar de ouvir
     */
    ListenerLayer.prototype.onIncomingCall = function (callback) {
        return this.registerEvent('onIncomingCall', callback);
    };
    ListenerLayer.prototype.onPresenceChanged = function (id, callback) {
        var ids = [];
        if (typeof id === 'function') {
            callback = id;
        }
        else if (Array.isArray(id)) {
            ids.push.apply(ids, id);
        }
        else {
            ids.push(id);
        }
        if (ids.length) {
            this.subscribePresence(ids);
        }
        return this.registerEvent(exposed_enum_1.ExposedFn.onPresenceChanged, function (presence) {
            // Only group events
            if (ids.length && !ids.includes(presence.id)) {
                return;
            }
            callback(presence);
        });
    };
    /**
     * Subscribe presence of a contact or group to use in onPresenceChanged (see {@link onPresenceChanged})
     *
     * ```typescript
     * // subcribe all contacts
     * const contacts = await client.getAllContacts();
     * await client.subscribePresence(contacts.map((c) => c.id._serialized));
     *
     * // subcribe all groups participants
     * const chats = await client.getAllGroups(false);
     * for (const c of chats) {
     *   const ids = c.groupMetadata.participants.map((p) => p.id._serialized);
     *   await client.subscribePresence(ids);
     * }
     * ```
     *
     * @param id contact id (xxxxx@c.us) or group id: xxxxx-yyyy@g.us
     * @returns number of subscribed
     */
    ListenerLayer.prototype.subscribePresence = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (id) { return WAPI.subscribePresence(id); }, id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Unsubscribe presence of a contact or group to use in onPresenceChanged (see {@link onPresenceChanged})
     * @param id contact id (xxxxx@c.us) or group id: xxxxx-yyyy@g.us
     * @returns number of unsubscribed
     */
    ListenerLayer.prototype.unsubscribePresence = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (id) { return WAPI.unsubscribePresence(id); }, id)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return ListenerLayer;
}(profile_layer_1.ProfileLayer));
exports.ListenerLayer = ListenerLayer;
