import { Browser, BrowserContext, LaunchOptions, Page } from 'puppeteer';
import { Logger } from 'winston';
import { SessionToken, TokenStore } from '../token-store';
export interface CreateConfig {
    /**
     * Headless chrome
     * @default true
     */
    headless?: boolean;
    /**
     * Open devtools by default
     * @default false
     */
    devtools?: boolean;
    /**
     * If false will use Chromium instance
     * @default true
     */
    useChrome?: boolean;
    /**
     * Opens a debug session
     * @default false
     */
    debug?: boolean;
    /**
     * If you want to use browserWSEndpoint
     */
    browserWS?: string;
    /**
     * Parameters to be added into the chrome browser instance
     */
    browserArgs?: string[];
    /**
     * Will be passed to puppeteer.launch
     */
    puppeteerOptions?: LaunchOptions;
    /**
     * Pass a external browser instance, can be used with electron
     */
    browser?: Browser | BrowserContext;
    /**
     * Pass a external page instance, can be used with electron
     */
    page?: Page;
    /**
     * Logs QR automatically in terminal
     * @default true
     */
    logQR?: boolean;
    /**
     * Will disable the welcoming message which appears in the beginning
     * @default false
     */
    disableWelcome?: boolean;
    /**
     * Logs info updates automatically in terminal
     * @default true
     */
    updatesLog?: boolean;
    /**
     * Automatically closes the wppconnect only when scanning the QR code (default 60000 miliseconds, if you want to turn it off, assign 0 or false)
     * @default 60000
     */
    autoClose?: number;
    /**
     * Wait for in chat to return a instance of {@link Whatsapp}
     * @default false
     */
    waitForLogin?: boolean;
    /**
     * Wait for in chat to return a instance of {@link Whatsapp}
     * @default false
     */
    logger?: Logger;
    /**
     * Initial token to log in in WhatsApp.
     * If not passed, the client will get it from {@link tokenStore}.
     */
    sessionToken?: SessionToken;
    /**
     * Token store used to manage token {@link tokenStore}
     * @default 'file'
     */
    tokenStore?: TokenStore | string;
    /** Folder name when saving tokens if {@link tokenStore} is 'file'.
     * @default 'tokens'
     */
    folderNameToken?: string;
    /**
     * folder directory tokens, just inside the wppconnect folder, example: { mkdirFolderToken: '/node_modules', } //will save the tokens folder in the node_modules directory
     * @deprecated See {@link tokenStore}
     */
    mkdirFolderToken?: string;
    /**
     * Creates a folder when inserting an object in the client's browser, to work it is necessary to pass the parameters in the function create browserSessionToken
     * @deprecated See {@link tokenStore}
     * @default true
     */
    createPathFileToken?: boolean;
    /**
     * Quando definido, essa opção força o carregamento de uma versão específica do WhatsApp WEB
     * Normalmente, versões mais antigas continuam funcionando por mais um tempo,
     * assim, com essa opção, é possível ter uma janela de tempo maior para se preparar para atualizações.
     * Caso seja definido vazio ou null, será usado a versão atual, ou seja, sem forçar versão específica.
     * @default 2.2126.x
     */
    whatsappVersion?: string;
}
export declare const defaultOptions: CreateConfig;
