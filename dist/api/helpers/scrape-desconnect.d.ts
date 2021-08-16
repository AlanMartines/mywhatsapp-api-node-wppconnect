import { Page } from 'puppeteer';
declare global {
    interface Window {
        Store: any;
    }
}
export declare function scrapeDesconnected(page: Page): Promise<boolean>;
