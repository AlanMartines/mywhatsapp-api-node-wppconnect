import { Page } from 'puppeteer';
import { CreateConfig } from '../../config/create-config';
import { SocketState } from '../model/enum';
import { ScrapQrcode } from '../model/qrcode';
import { LogLevel } from '../../utils/logger';
import { Logger } from 'winston';
import { CatchQRCallback, HostDevice, StatusFindCallback } from '../model';
import { TokenStore } from '../../token-store';
export declare class HostLayer {
    page: Page;
    readonly session: string;
    readonly options: CreateConfig;
    readonly logger: Logger;
    readonly tokenStore: TokenStore;
    protected autoCloseInterval: any;
    protected autoCloseCalled: boolean;
    protected statusFind?: StatusFindCallback;
    constructor(page: Page, session?: string, options?: CreateConfig);
    protected log(level: LogLevel, message: string, meta?: object): void;
    protected initialize(): Promise<void>;
    protected afterPageLoad(): Promise<void>;
    protected tryAutoClose(): void;
    protected startAutoClose(): void;
    protected cancelAutoClose(): void;
    getQrCode(): Promise<ScrapQrcode>;
    waitForQrCodeScan(catchQR?: CatchQRCallback): Promise<void>;
    waitForInChat(): Promise<true>;
    waitForPageLoad(): Promise<void>;
    waitForLogin(catchQR?: CatchQRCallback, statusFind?: StatusFindCallback): Promise<boolean>;
    /**
     * Delete the Service Workers
     * @category Host
     */
    killServiceWorker(): Promise<boolean>;
    /**
     * Load the service again
     * @category Host
     */
    restartService(): Promise<boolean>;
    /**
     * @category Host
     * @returns Current host device details
     */
    getHostDevice(): Promise<HostDevice>;
    /**
     * Retrieves WA version
     * @category Host
     */
    getWAVersion(): Promise<string>;
    /**
     * Retrieves the connecction state
     * @category Host
     */
    getConnectionState(): Promise<SocketState>;
    /**
     * Retrieves if the phone is online. Please note that this may not be real time.
     * @category Host
     */
    isConnected(): Promise<boolean>;
    /**
     * Retrieves if the phone is online. Please note that this may not be real time.
     * @category Host
     */
    isLoggedIn(): Promise<boolean>;
    /**
     * Retrieves Battery Level
     * @category Host
     */
    getBatteryLevel(): Promise<number>;
    /**
     * Start phone Watchdog, forcing the phone connection verification.
     *
     * @category Host
     * @param interval interval number in miliseconds
     */
    startPhoneWatchdog(interval?: number): Promise<void>;
    /**
     * Stop phone Watchdog, more details in {@link startPhoneWatchdog}
     * @category Host
     */
    stopPhoneWatchdog(interval: number): Promise<void>;
}
