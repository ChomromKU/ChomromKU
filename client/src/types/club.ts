import { User } from './auth';

export type Club = {
    id: number;
    label: string;
    branch: string;
    category: string;
    location: string;
    phoneNumber: string;
    members?: ClubMember[];
    socialMedia: SocialMedia
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
    role: string;
    user: User;
};

export type SocialMedia = {
    facebook?: string,
    instagram?: string,
    twitter?: string
}

