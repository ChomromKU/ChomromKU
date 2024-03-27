import { User } from './auth';

export type Club = {
    id: number;
    label: string;
    branch: string;
    category: string;
    location: string;
    phoneNumber: string;
    members?: ClubMember[];
    socialMedia: SocialMedia;
    memberRequestForm?: MemberRequestForm[]
    subscribers: User[];
};

export type ClubEvent = {
    id: number;
    title: string;
    startDate: string;
    endDate: string;
    location: string;
};

export type ClubMember = {
    id: number;
    role: Role;
    user: User;
};

export type SocialMedia = {
    facebook?: string,
    instagram?: string,
    twitter?: string
}

export type MemberRequestForm = {
    id: number,
    year: string,
    faculty : string,
    department : string,
    email: string,
    phoneNumber: string,
    reason: string,
}


export type Role = "PRESIDENT" | "VICE_PRESIDENT" | "ADMIN" | "NORMAL";


