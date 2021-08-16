import { CreateConfig } from '../../config/create-config';
import { SessionToken } from '../../token-store';
import { StatusFind } from './enum';
/**
 * A callback will be received, informing the status of the qrcode
 */
export declare type CatchQRCallback = (qrCode: string, asciiQR: string, attempt: number, urlCode?: string) => void;
/**
 * A callback will be received, informing the customer's status
 */
export declare type StatusFindCallback = (status: StatusFind | keyof typeof StatusFind, session: string) => void;
export interface CreateOptions extends CreateConfig {
    /**
     * You must pass a string type parameter, this parameter will be the name of the client's session. If the parameter is not passed, the section name will be "session".
     */
    session: string;
    /**
     * A callback will be received, informing the status of the qrcode
     */
    catchQR?: CatchQRCallback;
    /**
     * A callback will be received, informing the customer's status
     */
    statusFind?: StatusFindCallback;
    /**
     * Pass the session token information you can receive this token with the await client.getSessionTokenBrowser () function
     * @deprecated in favor of `sessionToken`
     */
    browserSessionToken?: SessionToken;
}
