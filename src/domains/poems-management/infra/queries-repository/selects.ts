import type { PoemSelect, SavedPoemSelect } from '@PrismaGenerated/models';
import { publicUserRelationFilter } from '@SharedKernel/policies/BannedUserVisibility';

const tagsSelect = {
	id: true,
	name: true,
} as const;

const publicEngagementCountSelect = {
	poemLikes: {
		where: {
			user: publicUserRelationFilter,
		},
	},
	comments: {
		where: {
			author: publicUserRelationFilter,
		},
	},
} as const;

export const savedPoemSelect = {
	poemId: true,
	createdAt: true,
	poem: {
		select: {
			title: true,
			slug: true,
			author: {
				select: {
					id: true,
					name: true,
					nickname: true,
					avatarUrl: true,
					status: true,
				},
			},
		},
	},
} as const satisfies SavedPoemSelect;

export const poemPreviewSelect = {
	id: true,
	title: true,
	slug: true,
	excerpt: true,
	createdAt: true,
	status: true,
	_count: {
		select: publicEngagementCountSelect,
	},
	author: {
		select: {
			id: true,
			name: true,
			nickname: true,
			avatarUrl: true,
			status: true,
		},
	},
	tags: {
		select: {
			id: true,
			name: true,
		},
	},
};

const dedicationsSelect = {
	toUser: {
		select: {
			id: true,
			name: true,
			nickname: true,
			avatarUrl: true,
			status: true,
			friendshipsFrom: {
				select: {
					userBId: true,
					userAId: true,
				},
			},
			friendshipsTo: {
				select: {
					userAId: true,
					userBId: true,
				},
			},
		},
	},
} as const;

const authorPreviewSelect = {
	id: true,
	name: true,
	nickname: true,
	avatarUrl: true,
	status: true,
	friendshipsFrom: {
		select: {
			userBId: true,
			userAId: true,
		},
	},
	friendshipsTo: {
		select: {
			userAId: true,
			userBId: true,
		},
	},
} as const;

export const myPoemSelect = {
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
	rejectionReason: true,

	isCommentable: true,

	createdAt: true,
	updatedAt: true,

	dedications: {
		select: dedicationsSelect,
	},

	_count: {
		select: publicEngagementCountSelect,
	},
} as const satisfies PoemSelect;

export const authorPoemSelect = {
	id: true,

	title: true,
	slug: true,
	excerpt: true,
	tags: { select: tagsSelect },
	content: true,
	audioUrl: true,

	status: true,
	visibility: true,
	moderationStatus: true,
	rejectionReason: true,

	isCommentable: true,

	updatedAt: true,
	createdAt: true,

	author: { select: authorPreviewSelect },

	dedications: {
		select: dedicationsSelect,
	},

	_count: { select: publicEngagementCountSelect },
} as const satisfies PoemSelect;
