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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.magix = exports.mediaTypes = exports.timeout = exports.makeOptions = void 0;
var crypto = __importStar(require("crypto"));
var futoin_hkdf_1 = __importDefault(require("futoin-hkdf"));
var atob = require("atob");
var makeOptions = function (useragentOverride) { return ({
    responseType: 'arraybuffer',
    headers: {
        'User-Agent': processUA(useragentOverride),
        DNT: 1,
        'Upgrade-Insecure-Requests': 1,
        origin: 'https://web.whatsapp.com/',
        referer: 'https://web.whatsapp.com/',
    },
}); };
exports.makeOptions = makeOptions;
var timeout = function (ms) {
    return new Promise(function (res) { return setTimeout(res, ms); });
};
exports.timeout = timeout;
exports.mediaTypes = {
    IMAGE: 'Image',
    VIDEO: 'Video',
    AUDIO: 'Audio',
    PTT: 'Audio',
    DOCUMENT: 'Document',
    STICKER: 'Image',
};
var processUA = function (userAgent) {
    var ua = userAgent ||
        'WhatsApp/2.16.352 Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36';
    if (!ua.includes('WhatsApp'))
        ua = 'WhatsApp/2.16.352 ' + ua;
    return ua;
};
var magix = function (fileData, mediaKeyBase64, mediaType, expectedSize) {
    var encodedHex = fileData.toString('hex');
    var encodedBytes = hexToBytes(encodedHex);
    var mediaKeyBytes = base64ToBytes(mediaKeyBase64);
    var info = "WhatsApp " + exports.mediaTypes[mediaType.toUpperCase()] + " Keys";
    var hash = 'sha256';
    var salt = new Uint8Array(32);
    var expandedSize = 112;
    var mediaKeyExpanded = futoin_hkdf_1.default(mediaKeyBytes, expandedSize, {
        salt: salt,
        info: info,
        hash: hash,
    });
    var iv = mediaKeyExpanded.slice(0, 16);
    var cipherKey = mediaKeyExpanded.slice(16, 48);
    var decipher = crypto.createDecipheriv('aes-256-cbc', cipherKey, iv);
    var decoded = decipher.update(encodedBytes);
    var mediaDataBuffer = expectedSize
        ? fixPadding(decoded, expectedSize)
        : decoded;
    return mediaDataBuffer;
};
exports.magix = magix;
var fixPadding = function (data, expectedSize) {
    var padding = (16 - (expectedSize % 16)) & 0xf;
    if (padding > 0) {
        if (expectedSize + padding == data.length) {
            //  console.log(`trimmed: ${padding} bytes`);
            data = data.slice(0, data.length - padding);
        }
        else if (data.length + padding == expectedSize) {
            // console.log(`adding: ${padding} bytes`);
            var arr = new Uint16Array(padding).map(function (b) { return padding; });
            data = Buffer.concat([data, Buffer.from(arr)]);
        }
    }
    //@ts-ignore
    return Buffer.from(data, 'utf-8');
};
var hexToBytes = function (hexStr) {
    var intArray = [];
    for (var i = 0; i < hexStr.length; i += 2) {
        intArray.push(parseInt(hexStr.substr(i, 2), 16));
    }
    return new Uint8Array(intArray);
};
var base64ToBytes = function (base64Str) {
    var binaryStr = atob(base64Str);
    var byteArray = new Uint8Array(binaryStr.length);
    for (var i = 0; i < binaryStr.length; i++) {
        byteArray[i] = binaryStr.charCodeAt(i);
    }
    return byteArray;
};
