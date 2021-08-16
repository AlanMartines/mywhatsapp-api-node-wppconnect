import { Page } from 'puppeteer';
import { CreateConfig } from '../../config/create-config';
import { Message, SendFileResult, SendLinkResult, SendStickerResult } from '../model';
import { ChatState } from '../model/enum';
import { ListenerLayer } from './listener.layer';
export declare class SenderLayer extends ListenerLayer {
    page: Page;
    constructor(page: Page, session?: string, options?: CreateConfig);
    /**
     * Automatically sends a link with the auto generated link preview. You can also add a custom message to be added.
     * @category Chat
     * @param chatId
     * @param url string A link, for example for youtube. e.g https://www.youtube.com/watch?v=Zi_XLOBDo_Y&list=RDEMe12_MlgO8mGFdeeftZ2nOQ&start_radio=1
     * @param title custom text as the message body, this includes the link or will be attached after the link
     */
    sendLinkPreview(chatId: string, url: string, title: string): Promise<SendLinkResult>;
    /**
     * Sends a text message to given chat
     * @category Chat
     * @param to chat id: xxxxx@us.c
     * @param content text message
     */
    sendText(to: string, content: string): Promise<Message>;
    /**
     *
     * @category Chat
     * @param chat
     * @param content
     * @param options
     * @returns
     */
    sendMessageOptions(chat: any, content: any, options?: any): Promise<Message>;
    /**
     * Sends image message
     * @category Chat
     * @param to Chat id
     * @param filePath File path or http link
     * @param filename
     * @param caption
     */
    sendImage(to: string, filePath: string, filename?: string, caption?: string): Promise<SendFileResult>;
    /**
     * Sends image message
     * @category Chat
     * @param to Chat id
     * @param base64 File path, http link or base64Encoded
     * @param filename
     * @param caption
     */
    sendImageFromBase64(to: string, base64: string, filename: string, caption?: string): Promise<SendFileResult>;
    /**
     * Sends message with thumbnail
     * @category Chat
     * @param thumb
     * @param url
     * @param title
     * @param description
     * @param chatId
     */
    sendMessageWithThumb(thumb: string, url: string, title: string, description: string, chatId: string): Promise<void>;
    /**
     * Replies to given mesage id of given chat id
     * @category Chat
     * @param to Chat id
     * @param content Message body
     * @param quotedMsg Message id to reply to.
     */
    reply(to: string, content: string, quotedMsg: string): Promise<Message>;
    /**
     * Sends ptt audio
     * base64 parameter should have mime type already defined
     * @category Chat
     * @param to Chat id
     * @param base64 base64 data
     * @param filename
     * @param caption
     */
    sendPttFromBase64(to: string, base64: string, filename: string, caption?: string): Promise<SendFileResult>;
    /**
     * Sends ptt audio from path
     * @category Chat
     * @param to Chat id
     * @param filePath File path
     * @param filename
     * @param caption
     */
    sendPtt(to: string, filePath: string, filename?: string, caption?: string): Promise<SendFileResult>;
    /**
     * Sends file
     * base64 parameter should have mime type already defined
     * @category Chat
     * @param to Chat id
     * @param base64 base64 data
     * @param filename
     * @param caption
     */
    sendFileFromBase64(to: string, base64: string, filename: string, caption?: string): Promise<SendFileResult>;
    /**
     * Sends file from path
     * @category Chat
     * @param to Chat id
     * @param filePath File path
     * @param filename
     * @param caption
     */
    sendFile(to: string, filePath: string, filename?: string, caption?: string): Promise<SendFileResult>;
    /**
     * Sends a video to given chat as a gif, with caption or not
     * @category Chat
     * @param to Chat id
     * @param filePath File path
     * @param filename
     * @param caption
     */
    sendVideoAsGif(to: string, filePath: string, filename?: string, caption?: string): Promise<void>;
    /**
     * Sends a video to given chat as a gif, with caption or not, using base64
     * @category Chat
     * @param to chat id xxxxx@us.c
     * @param base64 base64 data:video/xxx;base64,xxx
     * @param filename string xxxxx
     * @param caption string xxxxx
     */
    sendVideoAsGifFromBase64(to: string, base64: string, filename: string, caption?: string): Promise<void>;
    /**
     * Sends a video to given chat as a gif, with caption or not, using base64
     * @category Chat
     * @param to Chat id
     * @param filePath File path
     * @param filename
     * @param caption
     */
    sendGif(to: string, filePath: string, filename?: string, caption?: string): Promise<void>;
    /**
     * Sends a video to given chat as a gif, with caption or not, using base64
     * @category Chat
     * @param to chat id xxxxx@us.c
     * @param base64 base64 data:video/xxx;base64,xxx
     * @param filename string xxxxx
     * @param caption string xxxxx
     */
    sendGifFromBase64(to: string, base64: string, filename: string, caption?: string): Promise<void>;
    /**
     * Sends contact card to iven chat id
     * @category Chat
     * @param to Chat id
     * @param contactsId Example: 0000@c.us | [000@c.us, 1111@c.us]
     */
    sendContactVcard(to: string, contactsId: string | string[], name?: string): Promise<object>;
    /**
     * Send a list of contact cards
     * @category Chat
     * @param to Chat id
     * @param contacts Example: | ['000@c.us', '1111@c.us', {id: '2222@c.us', name: 'Test'}]
     */
    sendContactVcardList(to: string, contacts: (string | {
        id: string;
        name: string;
    })[]): Promise<object>;
    /**
     * Forwards array of messages (could be ids or message objects)
     * @category Chat
     * @param to Chat id
     * @param messages Array of messages ids to be forwarded
     * @param skipMyMessages
     * @returns array of messages ID
     */
    forwardMessages(to: string, messages: string | string[], skipMyMessages: boolean): Promise<string[]>;
    /**
     * Generates sticker from the provided animated gif image and sends it (Send image as animated sticker)
     * @category Chat
     *  @param path image path imageBase64 A valid gif image is required. You can also send via http/https (http://www.website.com/img.gif)
     *  @param to chatId '000000000000@c.us'
     */
    sendImageAsStickerGif(to: string, path: string): Promise<SendStickerResult | false>;
    /**
     * Generates sticker from given image and sends it (Send Image As Sticker)
     * @category Chat
     * @param path image path imageBase64 A valid png, jpg and webp image is required. You can also send via http/https (http://www.website.com/img.gif)
     * @param to chatId '000000000000@c.us'
     */
    sendImageAsSticker(to: string, path: string): Promise<SendStickerResult | false>;
    /**
     * TODO: Fix message not being delivered
     * Sends location to given chat id
     * @category Chat
     * @param to Chat id
     * @param latitude Latitude
     * @param longitude Longitude
     * @param title Text caption
     */
    sendLocation(to: string, latitude: string, longitude: string, title: string): Promise<object>;
    /**
     * Sets a chat status to seen. Marks all messages as ack: 3
     * @category Chat
     * @param chatId chat id: xxxxx@us.c
     */
    sendSeen(chatId: string): Promise<void>;
    /**
     * Starts typing ('Typing...' state)
     * @category Chat
     * @param chatId
     */
    startTyping(to: string): Promise<void>;
    /**
     * Stops typing ('Typing...' state)
     * @category Chat
     * @param chatId
     */
    stopTyping(to: string): Promise<void>;
    /**
     * Update your online presence
     * @category Chat
     * @param online true for available presence and false for unavailable
     */
    setOnlinePresence(online?: boolean): Promise<void>;
    /**
     * Sends text with tags
     * @category Chat
     */
    sendMentioned(to: string, message: string, mentioned: string[]): Promise<void>;
    /**
     * Sets the chat state
     * @category Chat
     * @param chatState
     * @param chatId
     */
    setChatState(chatId: string, chatState: ChatState): Promise<void>;
}
