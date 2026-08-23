export type Announcement = {
	id: number;
	title: string;
	body: string;
	audience: string;
	isPinned: boolean;
	publishedAt: Date | null;
	expiresAt: Date | null;
	createdByUserId: number;
	createdAt: Date;
	updatedAt: Date;
};
