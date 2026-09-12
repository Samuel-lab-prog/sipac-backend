import { t, type Static } from 'elysia';
import { createUserSchema } from '../users-management/ports/schemas/commands/create-user-schema';

export const role = t.UnionEnum(['student', 'professor', 'staff', 'admin']);
export const status = t.UnionEnum([
	'active',
	'pending',
	'blocked',
	'suspended',
]);
export const id = t.Numeric({ minimum: 1, multipleOf: 1 });
export const params = t.Object({ id });
export const filters = t.Object({
	page: t.Optional(t.Numeric({ minimum: 1, maximum: 100000, multipleOf: 1 })),
	q: t.Optional(t.String({ maxLength: 100 })),
	role: t.Optional(role),
	status: t.Optional(status),
	team: t.Optional(t.UnionEnum(['true'])),
	issue: t.Optional(t.UnionEnum(['missing-profile', 'unassigned-professor'])),
});
export const professionalFields = {
	departmentId: t.Nullable(id),
	registryCode: t.Nullable(t.String({ maxLength: 100 })),
	title: t.Nullable(t.String({ maxLength: 200 })),
	workload: t.Nullable(t.Integer({ minimum: 0, maximum: 168 })),
};
export const teamBody = t.Object({
	...createUserSchema.properties,
	role: t.UnionEnum(['professor', 'staff', 'admin']),
	password: t.String({ minLength: 8, maxLength: 64 }),
	...professionalFields,
});
export const profileBody = t.Object({
	name: t.String({ minLength: 3, maxLength: 200, pattern: '\\S' }),
	email: t.String({ format: 'email', maxLength: 254 }),
	...professionalFields,
});
export const accessBody = t.Object({
	role,
	status: t.UnionEnum(['active', 'blocked', 'suspended']),
});
export type UserFilters = Static<typeof filters>;
export type TeamBody = Static<typeof teamBody>;
export type ProfileBody = Static<typeof profileBody>;
export type AccessBody = Static<typeof accessBody>;
