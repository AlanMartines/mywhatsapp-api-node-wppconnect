import { Wid } from './wid';
import { ProfilePicThumbObj } from './profile-pic-thumb';
/**
 * Data info of contact
 */
export interface Contact {
    formattedName: string;
    id: Wid;
    isBusiness: boolean;
    isEnterprise: boolean;
    isHighLevelVerified: any;
    isMe: boolean;
    isMyContact: boolean;
    isPSA: boolean;
    isUser: boolean;
    isVerified: any;
    isWAContact: boolean;
    labels: any[];
    msgs: any;
    /**
     * Name of concat in your agenda
     */
    name?: string;
    plaintextDisabled: boolean;
    /**
     * @deprecated Depreciado em favor da função {@link getProfilePicFromServer}
     */
    profilePicThumbObj: ProfilePicThumbObj;
    /**
     * Name defined by common contact
     */
    pushname?: string;
    sectionHeader: any;
    shortName: string;
    statusMute: boolean;
    type: string;
    verifiedLevel: any;
    /**
     * Name defined by business contact
     */
    verifiedName?: any;
}
