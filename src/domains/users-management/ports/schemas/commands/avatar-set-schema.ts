import { t } from 'elysia';
import { avatarUrlSchema } from '../field-schemas';

export const setAvatarSchema = t.Object({
	avatarUrl: avatarUrlSchema,
});
