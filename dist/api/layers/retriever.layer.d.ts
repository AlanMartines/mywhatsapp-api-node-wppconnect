import { Page } from 'puppeteer';
import { CreateConfig } from '../../config/create-config';
import { SessionToken } from '../../token-store';
import { Chat, ProfilePicThumbObj, WhatsappProfile } from '../model';
import { SenderLayer } from './sender.layer';
export declare class RetrieverLayer extends SenderLayer {
    page: Page;
    constructor(page: Page, session?: string, options?: CreateConfig);
    /**
     * Returns a list of mute and non-mute users
     * @category Chat
     * @param type return type: all, toMute and noMute.
     * @returns obj
     */
    getListMutes(type?: string): Promise<object>;
    /**
     * Returns browser session token
     * @category Host
     * @returns obj [token]
     */
    getSessionTokenBrowser(removePath?: boolean): Promise<SessionToken>;
    /**
     * Receive the current theme
     * @category Host
     * @returns string light or dark
     */
    getTheme(): Promise<string>;
    /**
     * Receive all blocked contacts
     * @category Blocklist
     * @returns array of [0,1,2,3....]
     */
    getBlockList(): Promise<import("../model").Contact[]>;
    /**
     * Retrieves all chats
     * @category Chat
     * @returns array of [Chat]
     */
    getAllChats(withNewMessageOnly?: boolean): Promise<Chat[]>;
    /**
     * Checks if a number is a valid WA number
     * @category Contact
     * @param contactId, you need to include the @c.us at the end.
     * @returns contact detial as promise
     */
    checkNumberStatus(contactId: string): Promise<WhatsappProfile>;
    /**
     * Retrieves all chats with messages
     * @category Chat
     * @returns array of [Chat]
     */
    getAllChatsWithMessages(withNewMessageOnly?: boolean): Promise<Chat[]>;
    /**
     * Retrieve all groups
     * @category Group
     * @returns array of groups
     */
    getAllGroups(withNewMessagesOnly?: boolean): Promise<Chat[]>;
    /**
     * Retrieve all broadcast list
     * @category Group
     * @returns array of broadcast list
     */
    getAllBroadcastList(): Promise<Chat[]>;
    /**
     * Retrieves contact detail object of given contact id
     * @category Contact
     * @param contactId
     * @returns contact detial as promise
     */
    getContact(contactId: string): Promise<import("../model").Contact>;
    /**
     * Retrieves all contacts
     * @category Contact
     * @returns array of [Contact]
     */
    getAllContacts(): Promise<import("../model").Contact[]>;
    /**
     * Retrieves chat object of given contact id
     * @category Chat
     * @param contactId
     * @returns contact detial as promise
     */
    getChatById(contactId: string): Promise<Chat>;
    /**
     * Retrieves chat object of given contact id
     * @category Chat
     * @param contactId
     * @returns contact detial as promise
     * @deprecated
     */
    getChat(contactId: string): Promise<Chat>;
    /**
     * Retorna dados da imagem do contato
     * @category Contact
     * @param chatId Chat id
     * @returns url of the chat picture or undefined if there is no picture for the chat.
     */
    getProfilePicFromServer(chatId: string): Promise<ProfilePicThumbObj>;
    /**
     * Load more messages in chat object from server. Use this in a while loop
     * Depreciado em favor de {@link getMessages}
     *
     * @deprecated Depreciado em favor de getMessages
     * @category Chat
     * @param contactId
     * @returns contact detial as promise
     */
    loadEarlierMessages(contactId: string): Promise<import("../model").Message[]>;
    /**
     * Retrieves status of given contact
     * @category Contact
     * @param contactId
     */
    getStatus(contactId: string): Promise<import("../model").ContactStatus>;
    /**
     * Checks if a number is a valid whatsapp number
     * @category Contact
     * @param contactId, you need to include the @c.us at the end.
     * @returns contact detial as promise
     */
    getNumberProfile(contactId: string): Promise<WhatsappProfile>;
    /**
     * Retrieves all undread Messages
     * @category Chat
     * @param includeMe
     * @param includeNotifications
     * @param useUnreadCount
     * @returns any
     * @deprecated
     */
    getUnreadMessages(includeMe: boolean, includeNotifications: boolean, useUnreadCount: boolean): Promise<any>;
    /**
     * Retrieves all unread messages (where ack is -1)
     * @category Chat
     * @returns list of messages
     */
    getAllUnreadMessages(): Promise<import("../model").PartialMessage[]>;
    /**
     * Retrieves all new messages (where isNewMsg is true)
     * @category Chat
     * @returns List of messages
     * @deprecated Use getAllUnreadMessages
     */
    getAllNewMessages(): Promise<import("../model").Message[]>;
    /**
     * Retrieves all messages already loaded in a chat
     * For loading every message use loadAndGetAllMessagesInChat
     * Depreciado em favor de {@link getMessages}
     *
     * @deprecated Depreciado em favor de getMessages
     *
     * @category Chat
     * @param chatId, the chat to get the messages from
     * @param includeMe, include my own messages? boolean
     * @param includeNotifications
     * @returns any
     */
    getAllMessagesInChat(chatId: string, includeMe: boolean, includeNotifications: boolean): Promise<import("../model").Message[]>;
    /**
     * Loads and Retrieves all Messages in a chat
     * Depreciado em favor de {@link getMessages}
     *
     * @deprecated Depreciado em favor de getMessages
     * @category Chat
     * @param chatId, the chat to get the messages from
     * @param includeMe, include my own messages? boolean
     * @param includeNotifications
     * @returns any
     */
    loadAndGetAllMessagesInChat(chatId: string, includeMe?: boolean, includeNotifications?: boolean): Promise<import("../model").Message[]>;
    /**
     * Checks if a CHAT contact is online.
     * @category Chat
     * @param chatId chat id: xxxxx@c.us
     */
    getChatIsOnline(chatId: string): Promise<boolean>;
    /**
     * Retrieves the last seen of a CHAT.
     * @category Chat
     * @param chatId chat id: xxxxx@c.us
     */
    getLastSeen(chatId: string): Promise<number | boolean>;
}
