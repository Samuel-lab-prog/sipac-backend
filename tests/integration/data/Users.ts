import type { CreateUser } from '@Domains/users-management/ports/models';

function generateUsersData(quantity: number): CreateUser[] {
	const data: CreateUser[] = [];

	for (let i = 1; i <= quantity; i++) {
		data.push({
			email: `user${i}@gmail.com`,
			password: `password${i}`,
			nickname: `user${i}`,
			name: `user${i}`,
			bio: `user${i}bio`,
			avatarUrl: `http://example.com/avatar${i}.png`,
		});
	}
	return data;
}

const USERS_QUANTITY = 10;
export const usersData = generateUsersData(USERS_QUANTITY);
