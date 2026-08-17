import {
	AuthorPoemReadSchema,
	MyPoemReadSchema,
	PoemStatusEnumSchema,
	PoemVisibilityEnumSchema,
	PoemModerationStatusEnumSchema,
	CreatePoemResultSchema,
	CreatePoemBodySchema,
	UpdatePoemBodySchema,
	UpdatePoemResultSchema,
	PoemPreviewReadSchema,
	PoemPreviewPageSchema,
	SavedPoemSchema,
	PoemCollectionItemSchema,
	PoemCollectionSchema,
	CreateCollectionSchema,
} from '../ports/schemas/Index';

export type CreatePoem = (typeof CreatePoemBodySchema)['static'];
export type CreatePoemDB = CreatePoem & {
	slug: string;
	authorId: number;
	moderationStatus: PoemModerationStatus;
};
export type CreatePoemResult = (typeof CreatePoemResultSchema)['static'];

export type UpdatePoem = (typeof UpdatePoemBodySchema)['static'];
export type UpdatePoemDB = UpdatePoem & {
	slug: string;
	authorId: number;
	moderationStatus: PoemModerationStatus;
};
export type UpdatePoemResult = (typeof UpdatePoemResultSchema)['static'];

export type AuthorPoem = (typeof AuthorPoemReadSchema)['static'];
export type MyPoem = (typeof MyPoemReadSchema)['static'];
export type PoemStatus = (typeof PoemStatusEnumSchema)['static'];
export type PoemVisibility = (typeof PoemVisibilityEnumSchema)['static'];
export type PoemModerationStatus =
	(typeof PoemModerationStatusEnumSchema)['static'];

export type PoemPreview = (typeof PoemPreviewReadSchema)['static'];

export type PoemPreviewPage = (typeof PoemPreviewPageSchema)['static'];
export type SavedPoem = (typeof SavedPoemSchema)['static'];
export type PoemCollectionItem = (typeof PoemCollectionItemSchema)['static'];
export type PoemCollection = (typeof PoemCollectionSchema)['static'];
export type CreateCollection = (typeof CreateCollectionSchema)['static'];
