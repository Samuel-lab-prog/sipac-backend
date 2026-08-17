export type UserRole = 'author' | 'moderator' | 'admin';
export type UserStatus = 'active' | 'suspended' | 'banned';

export type PoemStatus = 'draft' | 'published';
export type PoemVisibility = 'public' | 'private' | 'unlisted' | 'friends';
export type PoemModerationStatus =
	| 'pending'
	| 'approved'
	| 'rejected'
	| 'removed';

export type SanctionType = 'suspension' | 'ban';

export type CommentStatus =
	| 'visible'
	| 'deletedByAuthor'
	| 'deletedByModerator';
