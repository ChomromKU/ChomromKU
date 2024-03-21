import { Club , SocialMedia} from "./club";
import { User } from "./auth";

export interface Like {
    id: number;
    createdAt: Date;
    user: User;
    userId: number;
    post?: Post;
    postId?: number;
    event?: Event;
    eventId?: number;
}

export interface Comment {
    id: number;
    message: string;
    createdAt: Date;
    user: User;
    userId: number;
    post?: Post; // Optional post property
    postId?: number; // Optional postId property
    event?: Event; // Optional event property
    eventId?: number; // Optional eventId property
}

export interface Post {
    id: number;
    title: string;
    type: PostType;
    content: string;
    imageUrl: string;
    approved: boolean;
    createdAt: Date;
    updatedAt: Date;
    likes: Like[];
    comments: Comment[];
    club: Club;
    clubId: number;
    owner: User;
    ownerId: number;
}

export enum PostType {
    NORMAL_POST,
    QA,
    NEWS
}

export type PostFormType = "normal_post" | "news" | "qna" | "event";

export interface PostIncludeAll {
    club: Club;
    owner: User;
    likes: Like[];
    comments: Comment[];
}

export interface Owner {
    id: number;
    stdId: string;
    stdCode: string;
    titleTh: string;
    titleEn: string;
    firstNameTh: string;
    lastNameTh: string;
    firstNameEn: string;
    lastNameEn: string;
    campusNameTh: string;
    campusNameEn: string;
}