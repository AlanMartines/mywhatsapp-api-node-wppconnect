/// <reference types="node" />
import { Page } from 'puppeteer';
import { BusinessLayer } from './layers/business.layer';
import { GetMessagesParam, Message } from './model';
import { CreateConfig } from '../config/create-config';
export declare class Whatsapp extends BusinessLayer {
    page: Page;
    constructor(page: Page, session?: string, options?: CreateConfig);
    /**
     * Decrypts message file
     * @param data Message object
     * @returns Decrypted file buffer (null otherwise)
     */
    downloadFile(data: string): Promise<string | boolean>;
    /**
     * Download and returns the media content in base64 format
     * @param messageId Message ou id
     * @returns Base64 of media
     */
    downloadMedia(messageId: string | Message): Promise<string>;
    /**
     * Get the puppeteer page instance
     * @returns The Whatsapp page
     */
    get waPage(): Page;
    /**
     * Clicks on 'use here' button (When it get unlaunched)
     * This method tracks the class of the button
     * Whatsapp web might change this class name over the time
     * Dont rely on this method
     */
    useHere(): Promise<boolean>;
    /**
     * Logout whastapp
     * @returns boolean
     */
    logout(): Promise<boolean>;
    /**
     * Closes page and browser
     * @internal
     */
    close(): Promise<boolean>;
    /**
     * Get message by id
     * @param messageId string
     * @returns Message object
     */
    getMessageById(messageId: string): Promise<Message>;
    /**
     * Retorna uma lista de mensagens de um chat
     * @param chatId string ID da conversa ou do grupo
     * @param params GetMessagesParam Opções de filtragem de resultados (count, id, direction) veja {@link GetMessagesParam}.
     * @returns Message object
     */
    getMessages(chatId: string, params?: GetMessagesParam): Promise<Message[]>;
    /**
     * Decrypts message file
     * @param message Message object
     * @returns Decrypted file buffer (null otherwise)
     */
    decryptFile(message: Message): Promise<Buffer>;
    /**
     * Rejeita uma ligação recebida pelo WhatsApp
     * @param callId string ID da ligação, caso não passado, todas ligações serão rejeitadas
     * @returns Número de ligações rejeitadas
     */
    rejectCall(callId?: string): Promise<number>;
}
