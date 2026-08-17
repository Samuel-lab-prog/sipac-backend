import type { PoemSelect } from '@PrismaGenerated/models';

const tagsSelect = {
	id: true,
	name: true,
} as const;

export const insertPoemSelect = {
	id: true,

	title: true,
	slug: true,
	excerpt: true,
	tags: { select: tagsSelect },
	content: true,
	audioUrl: true,

	visibility: true,
	status: true,
	moderationStatus: true,

	createdAt: true,
	updatedAt: true,

	isCommentable: true,

	dedications: {
		select: {
			toUserId: true,
		},
	},

	userMentions: {
		select: {
			mentionedUserId: true,
		},
	},
} as const satisfies PoemSelect;

export const updatePoemSelect = {
	id: true,

	title: true,
	slug: true,
	excerpt: true,
	tags: { select: tagsSelect },
	content: true,
	audioUrl: true,

	visibility: true,
	status: true,

	isCommentable: true,

	createdAt: true,
	updatedAt: true,

	dedications: {
		select: {
			toUserId: true,
		},
	},

	userMentions: {
		select: {
			mentionedUserId: true,
		},
	},
} as const satisfies PoemSelect;
