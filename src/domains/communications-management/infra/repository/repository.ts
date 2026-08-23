import { prisma } from '@Prisma';
import { withPrismaErrorHandling } from '@PrismaErrorHandler';
import type { Announcement } from '../../ports/models';
import type {
	AnnouncementListItem,
	CommunicationsCommandsRepository,
	CommunicationsQueriesRepository,
	CreateAnnouncementParams,
} from '../../ports/queries';

export function createAnnouncement(
	params: CreateAnnouncementParams,
): Promise<Announcement> {
	return withPrismaErrorHandling(() =>
		prisma.announcement.create({
			data: {
				title: params.title,
				body: params.body,
				audience: params.audience,
				isPinned: params.isPinned ?? false,
				publishedAt: params.publishedAt ? new Date(params.publishedAt) : new Date(),
				expiresAt: params.expiresAt ? new Date(params.expiresAt) : null,
				createdByUserId: params.actorId,
			},
		}),
	);
}

export function listAnnouncementsForUser(
	userId: number,
	role: string,
): Promise<AnnouncementListItem[]> {
	return withPrismaErrorHandling(() =>
		prisma.announcement
			.findMany({
				where: {
					AND: [
						{ OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
						{ publishedAt: { not: null } },
					],
				},
				include: {
					createdBy: {
						select: {
							name: true,
						},
					},
				},
				orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
			})
			.then((announcements) =>
				announcements.map((announcement) => {
					const { createdBy, ...rest } = announcement;
					return {
						...rest,
						createdByName: createdBy.name,
					};
				}),
			),
	);
}

export const commandsRepository: CommunicationsCommandsRepository = {
	createAnnouncement,
};

export const queriesRepository: CommunicationsQueriesRepository = {
	listAnnouncementsForUser,
};
