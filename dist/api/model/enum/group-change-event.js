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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupChangeEvent = void 0;
var GroupChangeEvent;
(function (GroupChangeEvent) {
    GroupChangeEvent["Add"] = "add";
    GroupChangeEvent["Inivite"] = "invite";
    GroupChangeEvent["Leave"] = "leave";
    GroupChangeEvent["Remove"] = "remove";
})(GroupChangeEvent = exports.GroupChangeEvent || (exports.GroupChangeEvent = {}));
