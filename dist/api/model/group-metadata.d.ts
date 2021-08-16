import { Wid } from './wid';
export interface GroupMetadata {
    id: Wid;
    creation: number;
    owner: Wid;
    participants: any[];
    pendingParticipants: any[];
}
