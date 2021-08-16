import { Page } from 'puppeteer';
import { CreateConfig } from '../../config/create-config';
import { UILayer } from './ui.layer';
export declare class ControlsLayer extends UILayer {
    page: Page;
    constructor(page: Page, session?: string, options?: CreateConfig);
    /**
     * Unblock contact
     * @category Blocklist
     * @param contactId {string} id '000000000000@c.us'
     * @returns boolean
     */
    unblockContact(contactId: string): Promise<boolean>;
    /**
     * Block contact
     * @category Blocklist
     * @param contactId {string} id '000000000000@c.us'
     * @returns boolean
     */
    blockContact(contactId: string): Promise<boolean>;
    /**
     * puts the chat as unread
     * @category Chat
     * @param contactId {string} id '000000000000@c.us'
     * @returns boolean
     */
    markUnseenMessage(contactId: string): Promise<boolean>;
    /**
     * Deletes the given chat
     * @category Chat
     * @param chatId {string} id '000000000000@c.us'
     * @returns boolean
     */
    deleteChat(chatId: string): Promise<boolean>;
    /**
     * Archive and unarchive chat messages with true or false
     * @category Chat
     * @param chatId {string} id '000000000000@c.us'
     * @param option {boolean} true or false
     * @returns boolean
     */
    archiveChat(chatId: string, option?: boolean): Promise<boolean>;
    /**
     * Pin and Unpin chat messages with true or false
     * @category Chat
     * @param chatId {string} id '000000000000@c.us'
     * @param option {boolean} true or false
     * @param nonExistent {boolean} Pin chat, non-existent (optional)
     * @returns object
     */
    pinChat(chatId: string, option: boolean, nonExistent?: boolean): Promise<object>;
    /**
     * Deletes all messages of given chat
     * @category Chat
     * @param chatId
     * @param keepStarred Keep starred messages
     * @returns boolean
     */
    clearChat(chatId: string, keepStarred?: boolean): Promise<void>;
    /**
     * Deletes message of given message id
     * @category Chat
     * @param chatId The chat id from which to delete the message.
     * @param messageId The specific message id of the message to be deleted
     * @param onlyLocal If it should only delete locally (message remains on the other recipienct's phone). Defaults to false.
     */
    deleteMessage(chatId: string, messageId: string[] | string, onlyLocal?: boolean): Promise<boolean>;
    /**
     * Stars message of given message id
     * @category Chat
     * @param messagesId The specific message id of the message to be starred
     * @param star Add or remove star of the message. Defaults to true.
     */
    starMessage(messagesId: string[] | string, star?: boolean): Promise<number>;
    /**
     * Allow only admin to send messages with true or false
     * @category Group
     * @param chatId {string} id '000000000000@c.us'
     * @param option {boolean} true or false
     * @returns boolean
     */
    setMessagesAdminsOnly(chatId: string, option: boolean): Promise<boolean>;
    /**
     * Enable or disable temporary messages with true or false
     * @category Chat
     * @param chatOrGroupId id '000000000000@c.us' or '000000-000000@g.us'
     * @param value true or false
     * @returns boolean
     */
    setTemporaryMessages(chatOrGroupId: string, value: boolean): Promise<boolean>;
}
