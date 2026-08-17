import { DateSchema, idSchema } from '@SharedKernel/Schemas';
import { t } from 'elysia';
import { sanctionReasonSchema } from './Fields';

const sanctionTypeSchema = t.UnionEnum(['ban', 'suspension'] as const);

export const userSanctionSchema = t.Object({
	id: idSchema,
	userId: idSchema,
	moderatorId: idSchema,
	type: sanctionTypeSchema,
	reason: sanctionReasonSchema,
	startAt: DateSchema,
	endAt: t.Nullable(DateSchema),
});

export const userSanctionsResponseSchema = t.Object({
	items: t.Array(userSanctionSchema),
});
