import type { AppError } from '@AppError';
import {
	API_INSTANCE,
	API_PREFIX,
	jsonRequest,
} from '@GenericSubdomains/utils/testing/utils';
import type { UserRole, UserStatus } from '@SharedKernel/Enums.ts';

export type AuthUser = {
	cookie: string;
	id: number;
	role: UserRole;
	status: UserStatus;
};

/**
 * Logs in a user and updates their cookie.
 * @param email - The email of the user to log in.
 * @param password - The password of the user to log in.
 * @returns Cookie and id.
 *
 */
export async function loginUser(
	email: string,
	password: string,
): Promise<AuthUser | AppError> {
	const res = await API_INSTANCE.handle(
		jsonRequest(`${API_PREFIX}/auth/login`, {
			method: 'POST',
			body: { email, password },
		}),
	);
	const cookie = res.headers.get('set-cookie');
	const parsed = await res.json();

	if (!res.ok || !cookie) return parsed as AppError;
	const okResult = parsed as { id: number; role: UserRole; status: UserStatus };
	return { cookie, ...okResult };
}
