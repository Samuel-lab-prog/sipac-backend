import { clearDatabase } from '@ClearDatabase';
import { setupHttpUsers } from 'tests/integration/TestsSetups.ts';
import type { AuthUser } from '../endpoints/Index';

export async function setupFriendsIntegrationScenario(): Promise<{
	user1: AuthUser;
	user2: AuthUser;
}> {
	await clearDatabase();
	const users = await setupHttpUsers();
	const [user1, user2] = users;

	if (!user1 || !user2) throw new Error('Not enough users set up for tests');

	return { user1, user2 };
}
