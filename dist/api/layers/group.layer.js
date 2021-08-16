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
exports.GroupLayer = void 0;
var helpers_1 = require("../helpers");
var retriever_layer_1 = require("./retriever.layer");
var GroupLayer = /** @class */ (function (_super) {
    __extends(GroupLayer, _super);
    function GroupLayer(page, session, options) {
        var _this = _super.call(this, page, session, options) || this;
        _this.page = page;
        return _this;
    }
    /**
     * Removes the host device from the group
     * @category Group
     * @param groupId group id
     */
    GroupLayer.prototype.leaveGroup = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (groupId) { return WAPI.leaveGroup(groupId); }, groupId)];
            });
        });
    };
    /**
     * Retrieves group members as [Id] objects
     * @category Group
     * @param groupId group id
     */
    GroupLayer.prototype.getGroupMembersIds = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, helpers_1.evaluateAndReturn(this.page, function (groupId) { return WAPI.getGroupParticipantIDs(groupId); }, groupId)];
            });
        });
    };
    /**
     * Returns group members [Contact] objects
     * @category Group
     * @param groupId
     */
    GroupLayer.prototype.getGroupMembers = function (groupId) {
        return __awaiter(this, void 0, void 0, function () {
            var membersIds, actions;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getGroupMembersIds(groupId)];
                    case 1:
                        membersIds = _a.sent();
                        actions = membersIds.map(function (memberId) {
                            return _this.getContact(memberId._serialized);
                        });
                        return [2 /*return*/, Promise.all(actions)];
                }
            });
        });
    };
    /**
     * Generates group-invite link
     * @category Group
     * @param chatId
     * @returns Invitation link
     */
    GroupLayer.prototype.getGroupInviteLink = function (chatId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (chatId) { return WAPI.getGroupInviteLink(chatId); }, chatId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Revokes group-invite link and generate new one.
     * @category Group
     * @param chatId
     * @returns Invitation link
     */
    GroupLayer.prototype.revokeGroupInviteLink = function (chatId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (chatId) { return WAPI.revokeGroupInviteLink(chatId); }, chatId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Generates group-invite link
     * @category Group
     * @param inviteCode
     * @returns Invite code from group link. Example: CMJYfPFqRyE2GxrnkldYED
     */
    GroupLayer.prototype.getGroupInfoFromInviteLink = function (inviteCode) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        inviteCode = inviteCode.replace('chat.whatsapp.com/', '');
                        inviteCode = inviteCode.replace('invite/', '');
                        inviteCode = inviteCode.replace('https://', '');
                        inviteCode = inviteCode.replace('http://', '');
                        return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (inviteCode) { return WAPI.getGroupInfoFromInviteLink(inviteCode); }, inviteCode)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Creates a new chat group
     * @category Group
     * @param groupName Group name
     * @param contacts Contacts that should be added.
     */
    GroupLayer.prototype.createGroup = function (groupName, contacts) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var groupName = _a.groupName, contacts = _a.contacts;
                            return WAPI.createGroup(groupName, contacts);
                        }, { groupName: groupName, contacts: contacts })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Removes participant from group
     * @category Group
     * @param groupId Chat id ('0000000000-00000000@g.us')
     * @param participantId Participant id'000000000000@c.us'
     */
    GroupLayer.prototype.removeParticipant = function (groupId, participantId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var groupId = _a.groupId, participantId = _a.participantId;
                            return WAPI.removeParticipant(groupId, participantId);
                        }, { groupId: groupId, participantId: participantId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Adds participant to Group
     * @category Group
     * @param groupId Chat id ('0000000000-00000000@g.us')
     * @param participantId Participant id'000000000000@c.us'
     */
    GroupLayer.prototype.addParticipant = function (groupId, participantId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var groupId = _a.groupId, participantId = _a.participantId;
                            return WAPI.addParticipant(groupId, participantId);
                        }, { groupId: groupId, participantId: participantId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Promotes participant as Admin in given group
     * @category Group
     * @param groupId Chat id ('0000000000-00000000@g.us')
     * @param participantId Participant id'000000000000@c.us'
     */
    GroupLayer.prototype.promoteParticipant = function (groupId, participantId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var groupId = _a.groupId, participantId = _a.participantId;
                            return WAPI.promoteParticipant(groupId, participantId);
                        }, { groupId: groupId, participantId: participantId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Demotes admin privileges of participant
     * @category Group
     * @param groupId Chat id ('0000000000-00000000@g.us')
     * @param participantId Participant id'000000000000@c.us'
     */
    GroupLayer.prototype.demoteParticipant = function (groupId, participantId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var groupId = _a.groupId, participantId = _a.participantId;
                            return WAPI.demoteParticipant(groupId, participantId);
                        }, { groupId: groupId, participantId: participantId })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Retrieves group admins
     * @category Group
     * @param chatId Group/Chat id ('0000000000-00000000@g.us')
     */
    GroupLayer.prototype.getGroupAdmins = function (chatId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (chatId) { return WAPI.getGroupAdmins(chatId); }, chatId)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Join a group with invite code
     * @category Group
     * @param inviteCode
     */
    GroupLayer.prototype.joinGroup = function (inviteCode) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        inviteCode = inviteCode.replace('chat.whatsapp.com/', '');
                        inviteCode = inviteCode.replace('invite/', '');
                        inviteCode = inviteCode.replace('https://', '');
                        inviteCode = inviteCode.replace('http://', '');
                        return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (inviteCode) { return WAPI.joinGroup(inviteCode); }, inviteCode)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Set group description (if allowed)
     * @category Group
     * @param groupId Group ID ('000000-000000@g.us')
     * @param description New group description
     * @returns empty object
     */
    GroupLayer.prototype.setGroupDescription = function (groupId, description) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var groupId = _a.groupId, description = _a.description;
                            return WAPI.setGroupDescription(groupId, description);
                        }, { groupId: groupId, description: description })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Set group subject (if allowed)
     * @category Group
     * @param groupId Group ID ('000000-000000@g.us')
     * @param title New group subject
     * @returns empty object
     */
    GroupLayer.prototype.setGroupSubject = function (groupId, title) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var groupId = _a.groupId, title = _a.title;
                            return WAPI.setGroupSubject(groupId, title);
                        }, { groupId: groupId, title: title })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Enable or disable group properties, see {@link GroupProperty for details}
     * @category Group
     * @param groupId Group ID ('000000-000000@g.us')
     * @param property
     * @param value true or false
     * @returns empty object
     */
    GroupLayer.prototype.setGroupProperty = function (groupId, property, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, helpers_1.evaluateAndReturn(this.page, function (_a) {
                            var groupId = _a.groupId, property = _a.property, value = _a.value;
                            return WAPI.setGroupProperty(groupId, property, value);
                        }, { groupId: groupId, property: property, value: value })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return GroupLayer;
}(retriever_layer_1.RetrieverLayer));
exports.GroupLayer = GroupLayer;
