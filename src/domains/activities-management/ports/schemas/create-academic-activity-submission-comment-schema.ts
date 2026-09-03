import { t } from 'elysia';

export const createAcademicActivitySubmissionCommentSchema = t.Object({
	body: t.String({ minLength: 1, maxLength: 2000 }),
});
