import { t } from 'elysia';
import { idSchema } from '@SharedKernel/Schemas';

export const authClientSchema = t.Object({
	id: idSchema,
	role: t.String(),
	status: t.String(),
});
