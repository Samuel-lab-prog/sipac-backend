export type UserRole = 'admin' | 'author' | 'moderator';
export type UserStatus = 'active' | 'suspended' | 'blocked';

export type PoemModerationStatus = 'pending' | 'approved' | 'rejected';
export type PoemStatus = 'draft' | 'published' | 'archived' | 'removed';
export type PoemVisibility = 'public' | 'private' | 'friends' | 'unlisted';
