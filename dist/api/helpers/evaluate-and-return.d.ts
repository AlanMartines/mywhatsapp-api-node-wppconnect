import { EvaluateFn, EvaluateFnReturnType, Page, SerializableOrJSHandle } from 'puppeteer';
export declare function evaluateAndReturn<T extends EvaluateFn>(page: Page, pageFunction: T, ...args: SerializableOrJSHandle[]): Promise<EvaluateFnReturnType<T> extends PromiseLike<infer U> ? U : EvaluateFnReturnType<T>>;
