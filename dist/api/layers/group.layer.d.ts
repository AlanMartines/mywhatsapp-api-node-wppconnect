import { Page } from 'puppeteer';
import { CreateConfig } from '../../config/create-config';
import { Id } from '../model';
import { GroupProperty } from '../model/enum';
import { RetrieverLayer } from './retriever.layer';
export declare class GroupLayer extends RetrieverLayer {
    page: Page;
    constructor(page: Page, session?: string, options?: CreateConfig);
    /**
     * Removes the host device from the group
     * @category Group
     * @param groupId group id
     */
    leaveGroup(groupId: string): Promise<any>;
    /**
     * Retrieves group members as [Id] objects
     * @category Group
     * @param groupId group id
     */
    getGroupMembersIds(groupId: string): Promise<Id[]>;
    /**
     * Returns group members [Contact] objects
     * @category Group
     * @param groupId
     */
    getGroupMembers(groupId: string): Promise<import("../model").Contact[]>;
    /**
     * Generates group-invite link
     * @category Group
     * @param chatId
     * @returns Invitation link
     */
    getGroupInviteLink(chatId: string): Promise<string>;
    /**
     * Revokes group-invite link and generate new one.
     * @category Group
     * @param chatId
     * @returns Invitation link
     */
    revokeGroupInviteLink(chatId: string): Promise<string>;
    /**
     * Generates group-invite link
     * @category Group
     * @param inviteCode
     * @returns Invite code from group link. Example: CMJYfPFqRyE2GxrnkldYED
     */
    getGroupInfoFromInviteLink(inviteCode: string): Promise<string | boolean>;
    /**
     * Creates a new chat group
     * @category Group
     * @param groupName Group name
     * @param contacts Contacts that should be added.
     */
    createGroup(groupName: string, contacts: string | string[]): Promise<import("../model").GroupCreation>;
    /**
     * Removes participant from group
     * @category Group
     * @param groupId Chat id ('0000000000-00000000@g.us')
     * @param participantId Participant id'000000000000@c.us'
     */
    removeParticipant(groupId: string, participantId: string | string[]): Promise<void>;
    /**
     * Adds participant to Group
     * @category Group
     * @param groupId Chat id ('0000000000-00000000@g.us')
     * @param participantId Participant id'000000000000@c.us'
     */
    addParticipant(groupId: string, participantId: string | string[]): Promise<boolean>;
    /**
     * Promotes participant as Admin in given group
     * @category Group
     * @param groupId Chat id ('0000000000-00000000@g.us')
     * @param participantId Participant id'000000000000@c.us'
     */
    promoteParticipant(groupId: string, participantId: string | string[]): Promise<void>;
    /**
     * Demotes admin privileges of participant
     * @category Group
     * @param groupId Chat id ('0000000000-00000000@g.us')
     * @param participantId Participant id'000000000000@c.us'
     */
    demoteParticipant(groupId: string, participantId: string | string[]): Promise<void>;
    /**
     * Retrieves group admins
     * @category Group
     * @param chatId Group/Chat id ('0000000000-00000000@g.us')
     */
    getGroupAdmins(chatId: string): Promise<import("../model").Contact[]>;
    /**
     * Join a group with invite code
     * @category Group
     * @param inviteCode
     */
    joinGroup(inviteCode: string): Promise<string | boolean>;
    /**
     * Set group description (if allowed)
     * @category Group
     * @param groupId Group ID ('000000-000000@g.us')
     * @param description New group description
     * @returns empty object
     */
    setGroupDescription(groupId: string, description: string): Promise<object>;
    /**
     * Set group subject (if allowed)
     * @category Group
     * @param groupId Group ID ('000000-000000@g.us')
     * @param title New group subject
     * @returns empty object
     */
    setGroupSubject(groupId: string, title: string): Promise<object>;
    /**
     * Enable or disable group properties, see {@link GroupProperty for details}
     * @category Group
     * @param groupId Group ID ('000000-000000@g.us')
     * @param property
     * @param value true or false
     * @returns empty object
     */
    setGroupProperty(groupId: string, property: GroupProperty, value: boolean): Promise<object>;
}
