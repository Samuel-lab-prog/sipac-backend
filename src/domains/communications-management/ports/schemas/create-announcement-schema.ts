import { t } from 'elysia';

export const createAnnouncementSchema = t.Object({
	title: t.String({ minLength: 1, example: 'Aviso institucional' }),
	body: t.String({ minLength: 1, example: 'Feriado na próxima sexta-feira.' }),
	audience: t.Union([
		t.Literal('all'),
		t.Literal('student'),
		t.Literal('professor'),
		t.Literal('staff'),
		t.Literal('admin'),
	]),
	isPinned: t.Optional(t.Boolean()),
	publishedAt: t.Optional(t.Nullable(t.String({ format: 'date-time' }))),
	expiresAt: t.Optional(t.Nullable(t.String({ format: 'date-time' }))),
});
