import { idSchema } from '@SharedKernel/schemas/schemas';
import { t } from 'elysia';

export const announcementBaseSchema = t.Object({
	id: idSchema,
	title: t.String({ minLength: 1, example: 'Reunião da semana' }),
	body: t.String({ minLength: 1, example: 'Haverá reunião na sala 12.' }),
	audience: t.String({ example: 'all' }),
	isPinned: t.Boolean(),
	publishedAt: t.Nullable(t.String({ format: 'date-time' })),
	expiresAt: t.Nullable(t.String({ format: 'date-time' })),
	createdByUserId: idSchema,
	createdAt: t.String({ format: 'date-time' }),
	updatedAt: t.String({ format: 'date-time' }),
});

export const announcementSchema = t.Object({
	...announcementBaseSchema.properties,
	createdByName: t.String({ example: 'Marina Silva' }),
});
