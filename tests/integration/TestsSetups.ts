import { isAppError } from '@GenericSubdomains/utils/testing/utils.ts';
import { usersData } from './data/Users.ts';
import { loginUser, type AuthUser } from './endpoints/Auth.ts';
import { createUser } from './endpoints/Users.ts';

/**
 * Sets up test users by creating and logging them in.
 * @returns A promise that resolves to an array of logged-in test users containing id, role, status and the generated cookie.
 */
export async function setupHttpUsers(): Promise<AuthUser[]> {
	const userPromises = usersData.map((data) => createUser(data));
	await Promise.all(userPromises);

	const loginPromises = usersData.map((data) =>
		loginUser(data.email, data.password),
	);
	const loginResults = await Promise.all(loginPromises);

	for (const result of loginResults) {
		if (isAppError(result))
			throw new Error(`Failed to set up users: ${result.message}`);

		if (!result || !result.cookie)
			throw new Error('Failed to set up users: Missing cookie');
	}

	return loginResults as AuthUser[];
}
