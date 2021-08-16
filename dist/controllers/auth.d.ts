import * as puppeteer from 'puppeteer';
export declare const getInterfaceStatus: (waPage: puppeteer.Page) => Promise<string | null>;
/**
 * Validates if client is authenticated
 * @returns true if is authenticated, false otherwise
 * @param waPage
 */
export declare const isAuthenticated: (waPage: puppeteer.Page) => Promise<boolean>;
export declare const needsToScan: (waPage: puppeteer.Page) => Promise<boolean>;
export declare const isInsideChat: (waPage: puppeteer.Page) => Promise<boolean>;
export declare const isConnectingToPhone: (waPage: puppeteer.Page) => Promise<boolean>;
export declare function asciiQr(code: string): Promise<string>;
export declare function injectSessionToken(page: puppeteer.Page, token?: any, clear?: boolean): Promise<void>;
