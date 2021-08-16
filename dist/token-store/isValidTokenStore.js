"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidTokenStore = void 0;
var keys = ['getToken', 'setToken', 'removeToken', 'listTokens'];
/**
 * Check and validate if the object implements the TokenStore interface
 * @param object Object to check that implements the TokenStore interface
 * @returns true if the object is a valid else false
 */
function isValidTokenStore(object) {
    return keys.every(function (k) { return k in object && typeof object[k] === 'function'; });
}
exports.isValidTokenStore = isValidTokenStore;
