export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    username?: string;
    bio?: string;
    role: 'user' | 'admin' | 'moderator';
    createdAt: Date;
}

export interface Video {
    id: string;
    title: string;
    description: string;
    url: string;
    thumbnailUrl: string;
    uploaderId: string;
    uploaderName: string;
    uploaderAvatar: string | null;
    views: number;
    likes: number;
    duration: number;
    createdAt: any; // Firestore Timestamp
    status: 'processing' | 'live' | 'failed';
    tags: string[];
}

export interface Comment {
    id: string;
    videoId: string;
    userId: string;
    userName: string;
    userAvatar: string | null;
    text: string;
    createdAt: any;
}
