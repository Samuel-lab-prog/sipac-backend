import { prisma } from '@Prisma/PrismaClient';

export async function selectBannedUserIds(): Promise<number[]> {
	const users = await prisma.user.findMany({
		where: { status: 'banned', deletedAt: null },
		select: { id: true },
	});

	return users.map((user) => user.id);
}

export function visibleNotificationActorWhere(bannedUserIds: number[]) {
	if (bannedUserIds.length === 0) return {};

	return {
		OR: [{ actorId: null }, { actorId: { notIn: bannedUserIds } }],
	};
}
