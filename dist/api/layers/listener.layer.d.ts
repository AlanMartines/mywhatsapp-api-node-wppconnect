import { Page } from 'puppeteer';
import { CreateConfig } from '../../config/create-config';
import { Ack, Chat, LiveLocation, Message, ParticipantEvent, PresenceEvent } from '../model';
import { SocketState, SocketStream } from '../model/enum';
import { InterfaceMode } from '../model/enum/interface-mode';
import { InterfaceState } from '../model/enum/interface-state';
import { ProfileLayer } from './profile.layer';
declare global {
    interface Window {
        onMessage: any;
        onAnyMessage: any;
        onStateChange: any;
        onStreamChange: any;
        onIncomingCall: any;
        onAck: any;
    }
}
export declare class ListenerLayer extends ProfileLayer {
    page: Page;
    private listenerEmitter;
    constructor(page: Page, session?: string, options?: CreateConfig);
    protected afterPageLoad(): Promise<void>;
    /**
     * Register the event and create a disposable object to stop the listening
     * @param event Name of event
     * @param listener The function to execute
     * @returns Disposable object to stop the listening
     */
    protected registerEvent(event: string | symbol, listener: (...args: any[]) => void): {
        dispose: () => void;
    };
    /**
     * @event Listens to all new messages received only.
     * @returns Disposable object to stop the listening
     */
    onMessage(callback: (message: Message) => void): {
        dispose: () => void;
    };
    /**
     * @event Listens to all new messages, sent and received.
     * @param to callback
     * @fires Message
     * @returns Disposable object to stop the listening
     */
    onAnyMessage(callback: (message: Message) => void): {
        dispose: () => void;
    };
    /**
     * @event Listens to all notification messages, like group changes, join, leave
     * @param to callback
     * @fires Message
     * @returns Disposable object to stop the listening
     */
    onNotificationMessage(callback: (message: Message) => void): {
        dispose: () => void;
    };
    /**
     * @event Listens List of mobile states
     * @returns Disposable object to stop the listening
     */
    onStateChange(callback: (state: SocketState) => void): {
        dispose: () => void;
    };
    /**
     * @event Returns the current state of the connection
     * @returns Disposable object to stop the listening
     */
    onStreamChange(callback: (state: SocketStream) => void): {
        dispose: () => void;
    };
    /**
     * @event Listens to interface mode change See {@link InterfaceState} and {@link InterfaceMode} for details
     * @returns Disposable object to stop the listening
     */
    onInterfaceChange(callback: (state: {
        displayInfo: InterfaceState;
        mode: InterfaceMode;
    }) => void): {
        dispose: () => void;
    };
    /**
     * @event Listens to messages acknowledgement Changes
     * @returns Disposable object to stop the listening
     */
    onAck(callback: (ack: Ack) => void): {
        dispose: () => void;
    };
    /**
     * Escuta os eventos de Localização em tempo real de todos os chats
     * @event Eventos de Localização em tempo real
     * @param callback Função para ser executada quando houver alterações
     * @returns Objeto descartável para parar de ouvir
     */
    onLiveLocation(callback: (liveLocationEvent: LiveLocation) => void): {
        dispose: () => void;
    };
    /**
     * Escuta os eventos de Localização em tempo real
     * @event Eventos de Localização em tempo real
     * @param id Único ID ou lista de IDs de contatos para acompanhar a localização
     * @param callback Função para ser executada quando houver alterações
     * @returns Objeto descartável para parar de ouvir
     */
    onLiveLocation(id: string | string[], callback: (liveLocationEvent: LiveLocation) => void): {
        dispose: () => void;
    };
    /**
     * @event Listens to participants changed
     * @param to callback
     * @returns Stream of ParticipantEvent
     */
    onParticipantsChanged(callback: (participantChangedEvent: ParticipantEvent) => void): {
        dispose: () => void;
    };
    /**
     * @event Listens to participants changed
     * @param to group id: xxxxx-yyyy@us.c
     * @param to callback
     * @returns Stream of ParticipantEvent
     */
    onParticipantsChanged(groupId: string, callback: (participantChangedEvent: ParticipantEvent) => void): {
        dispose: () => void;
    };
    /**
     * @event Fires callback with Chat object every time the host phone is added to a group.
     * @param to callback
     * @returns Disposable object to stop the listening
     */
    onAddedToGroup(callback: (chat: Chat) => any): {
        dispose: () => void;
    };
    /**
     * @event Escuta por ligações recebidas, seja de áudio ou vídeo.
     *
     * Para recusar a ligação, basta chamar o `rejectCall` {@link rejectCall}
     *
     * @returns Objeto descartável para parar de ouvir
     */
    onIncomingCall(callback: (call: any) => any): {
        dispose: () => void;
    };
    /**
     * Listens to presence changed, by default, it will triggered for active chats only or contacts subscribed (see {@link subscribePresence})
     * @event Listens to presence changed
     * @param callback Callback of on presence changed
     * @returns Disposable object to stop the listening
     */
    onPresenceChanged(callback: (presenceChangedEvent: PresenceEvent) => void): {
        dispose: () => void;
    };
    /**
     * Listens to presence changed, the callback will triggered only for passed IDs
     * @event Listens to presence changed
     * @param id contact id (xxxxx@c.us) or group id: xxxxx-yyyy@g.us
     * @param callback Callback of on presence changed
     * @returns Disposable object to stop the listening
     */
    onPresenceChanged(id: string | string[], callback: (presenceChangedEvent: PresenceEvent) => void): {
        dispose: () => void;
    };
    /**
     * Subscribe presence of a contact or group to use in onPresenceChanged (see {@link onPresenceChanged})
     *
     * ```typescript
     * // subcribe all contacts
     * const contacts = await client.getAllContacts();
     * await client.subscribePresence(contacts.map((c) => c.id._serialized));
     *
     * // subcribe all groups participants
     * const chats = await client.getAllGroups(false);
     * for (const c of chats) {
     *   const ids = c.groupMetadata.participants.map((p) => p.id._serialized);
     *   await client.subscribePresence(ids);
     * }
     * ```
     *
     * @param id contact id (xxxxx@c.us) or group id: xxxxx-yyyy@g.us
     * @returns number of subscribed
     */
    subscribePresence(id: string | string[]): Promise<number>;
    /**
     * Unsubscribe presence of a contact or group to use in onPresenceChanged (see {@link onPresenceChanged})
     * @param id contact id (xxxxx@c.us) or group id: xxxxx-yyyy@g.us
     * @returns number of unsubscribed
     */
    unsubscribePresence(id: string | string[]): Promise<number>;
}
