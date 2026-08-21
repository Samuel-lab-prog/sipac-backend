import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';
export const authClientSchema = t.Object({
	id: idSchema,
	role: t.String(),
	status: t.String(),
});
