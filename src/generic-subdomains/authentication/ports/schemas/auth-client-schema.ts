import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';
const userRoleSchema = t.Union([
	t.Literal('student'),
	t.Literal('professor'),
	t.Literal('staff'),
	t.Literal('admin'),
]);
const userStatusSchema = t.Union([
	t.Literal('active'),
	t.Literal('pending'),
	t.Literal('blocked'),
	t.Literal('suspended'),
]);

export const authClientSchema = t.Object({
	id: idSchema,
	role: userRoleSchema,
	status: userStatusSchema,
});
