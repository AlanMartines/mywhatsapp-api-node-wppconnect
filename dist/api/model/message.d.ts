import { Chat } from './chat';
import { Contact } from './contact';
import { MessageType } from './enum';
export interface Message {
    id: string;
    body: string;
    type: MessageType;
    /**
     * When type is GP2: {@link GroupNotificationType}
     */
    subtype: string;
    t: number;
    notifyName: string;
    from: string;
    to: string;
    author: string;
    self: string;
    ack: number;
    invis: boolean;
    isNewMsg: boolean;
    star: boolean;
    recvFresh: boolean;
    interactiveAnnotations: any[];
    clientUrl: string;
    deprecatedMms3Url: string;
    directPath: string;
    mimetype: string;
    filehash: string;
    uploadhash: string;
    size: number;
    mediaKey: string;
    mediaKeyTimestamp: number;
    width: number;
    height: number;
    broadcast: boolean;
    mentionedJidList: any[];
    isForwarded: boolean;
    labels: any[];
    sender: Contact;
    timestamp: number;
    content: string;
    isGroupMsg: boolean;
    isMMS: boolean;
    isMedia: boolean;
    isNotification: boolean;
    isPSA: boolean;
    /**
     * @deprecated Use o getChat para obter detalhes do chat
     */
    chat: Chat;
    lastSeen: null | number | boolean;
    chatId: string;
    /**
     * @deprecated Use o atributo quotedMsgId em getMessageById para obter detalhes da mensagem
     */
    quotedMsgObj: null;
    quotedMsgId: null;
    mediaData: MediaData;
    recipients?: string[];
}
export interface MediaData {
    type: string;
    mediaStage: string;
    animationDuration: number;
    animatedAsNewMsg: boolean;
    _swStreamingSupported: boolean;
    _listeningToSwSupport: boolean;
}
