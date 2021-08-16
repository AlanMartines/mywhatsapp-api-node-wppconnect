import { Browser, BrowserContext, Page } from 'puppeteer';
import { CreateConfig } from '../config/create-config';
import { Logger } from 'winston';
import { SessionToken } from '../token-store';
export declare function unregisterServiceWorker(page: Page): Promise<void>;
/**
 * Força o carregamento de uma versão específica do WhatsApp WEB
 * @param page Página a ser injetada
 * @param version Versão ou expressão semver
 */
export declare function setWhatsappVersion(page: Page, version: string): Promise<void>;
export declare function initWhatsapp(page: Page, token?: SessionToken, clear?: boolean, version?: string): Promise<Page>;
export declare function injectApi(page: Page): Promise<boolean | import("puppeteer").JSHandle<any>>;
/**
 * Initializes browser, will try to use chrome as default
 * @param session
 */
export declare function initBrowser(session: string, options: CreateConfig, logger: Logger): Promise<Browser>;
export declare function getOrCreatePage(browser: Browser | BrowserContext): Promise<Page>;
