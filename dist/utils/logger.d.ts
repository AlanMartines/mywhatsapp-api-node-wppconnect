import { TransformableInfo } from 'logform';
export declare type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';
export interface MetaInfo {
    session?: string;
    type?: string;
}
export interface SessionInfo extends TransformableInfo, MetaInfo {
}
export declare const formatLabelSession: import("logform").FormatWrap;
export declare const defaultLogger: import("winston").Logger;
