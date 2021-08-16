import { GroupChangeEvent } from './enum';
export interface ParticipantEvent {
    by: string;
    groupId: string;
    action: GroupChangeEvent;
    who: string[];
}
