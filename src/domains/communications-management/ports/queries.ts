import type { Announcement } from './models';

export type AnnouncementListItem = Announcement & {
	createdByName: string;
};

export type CreateAnnouncementParams = {
	title: string;
	body: string;
	audience: string;
	isPinned?: boolean;
	publishedAt?: Date | null;
	expiresAt?: Date | null;
	actorId: number;
	actorRole: 'student' | 'professor' | 'staff' | 'admin';
};

export interface CommunicationsQueriesRepository {
	listAnnouncementsForUser(userId: number, role: string): Promise<AnnouncementListItem[]>;
}

export interface CommunicationsQueriesServices {
	listAnnouncementsForUser(
		userId: number,
		role: 'student' | 'professor' | 'staff' | 'admin',
	): Promise<AnnouncementListItem[]>;
}

export interface CommunicationsCommandsRepository {
	createAnnouncement(params: CreateAnnouncementParams): Promise<Announcement>;
}

export interface CommunicationsCommandsServices {
	createAnnouncement(params: CreateAnnouncementParams): Promise<Announcement>;
}
