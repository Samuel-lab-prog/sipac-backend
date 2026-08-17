import { prisma } from '@Prisma/PrismaClient';

export const applicationTables = [
	'_PoemMentions',
	'_PoemToTag',
	'BlockedUser',
	'Collection',
	'CollectionItem',
	'Comment',
	'CommentLike',
	'Friendship',
	'FriendshipRequest',
	'Notification',
	'Poem',
	'PoemDedication',
	'PoemLike',
	'SavedPoem',
	'Tag',
	'User',
	'UserMention',
	'UserNotificationSetting',
	'UserSanction',
] as const;

const MAX_CLEAR_DATABASE_ATTEMPTS = 3;
const DEADLOCK_RETRY_DELAY_MS = 50;

export async function clearDatabase() {
	const tableList = applicationTables
		.map((table) => `"${table}"`)
		.join(',\n      ');

	const truncateStatement = `
    TRUNCATE TABLE
      ${tableList}
    RESTART IDENTITY CASCADE;
  `;

	await executeWithDeadlockRetry(truncateStatement);
}

async function executeWithDeadlockRetry(statement: string) {
	for (let attempt = 1; attempt <= MAX_CLEAR_DATABASE_ATTEMPTS; attempt++) {
		try {
			await prisma.$executeRawUnsafe(statement);
			return;
		} catch (error) {
			if (!isDeadlockError(error) || attempt === MAX_CLEAR_DATABASE_ATTEMPTS)
				throw error;

			await wait(DEADLOCK_RETRY_DELAY_MS * attempt);
		}
	}
}

function isDeadlockError(error: unknown) {
	const details = stringifyError(error).toLowerCase();
	return (
		details.includes('40p01') ||
		details.includes('deadlock') ||
		details.includes('impasse')
	);
}

function stringifyError(error: unknown) {
	if (!error) return '';
	if (error instanceof Error)
		return `${error.name} ${error.message} ${safeJson(error)}`;
	return safeJson(error);
}

function safeJson(value: unknown) {
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}

function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
