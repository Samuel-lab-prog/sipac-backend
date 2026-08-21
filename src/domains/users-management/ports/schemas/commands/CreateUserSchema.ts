import { t } from 'elysia';

export const CreateUserSchema = t.Object({
	name: t.String({ minLength: 1 }),
	nickname: t.String({ minLength: 3, maxLength: 32 }),
	email: t.String({ format: 'email' }),
	password: t.String({ minLength: 8 }),
	bio: t.String({ minLength: 1 }),
});
