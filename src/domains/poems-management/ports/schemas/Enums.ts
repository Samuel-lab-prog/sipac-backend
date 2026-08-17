import { t } from 'elysia';

export const PoemStatusEnumSchema = t.UnionEnum([
	'draft',
	'published',
] as const);

export const PoemVisibilityEnumSchema = t.UnionEnum([
	'public',
	'friends',
	'private',
	'unlisted',
] as const);

export const PoemModerationStatusEnumSchema = t.UnionEnum([
	'rejected',
	'removed',
	'approved',
	'pending',
] as const);
