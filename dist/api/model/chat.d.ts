import { Contact } from './contact';
import { GroupMetadata } from './group-metadata';
import { MessageId } from './message-id';
import { Presence } from './presence';
import { Wid } from './wid';
export interface Chat {
    id: Wid;
    pendingMsgs: boolean;
    lastReceivedKey: MessageId;
    t: number;
    unreadCount: number;
    archive: boolean;
    muteExpiration: number;
    name: string;
    notSpam: boolean;
    pin: number;
    msgs: null;
    kind: string;
    isBroadcast: boolean;
    isGroup: boolean;
    isReadOnly: boolean;
    isUser: boolean;
    contact: Contact;
    groupMetadata: GroupMetadata;
    presence: Presence;
}
