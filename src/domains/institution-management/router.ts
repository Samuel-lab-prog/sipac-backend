import { Elysia, t } from 'elysia';
import { prisma } from '@Prisma';
import { ForbiddenError } from '@DomainError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { activeAccount } from './access';

export const institutionRouter = new Elysia({ prefix: '/institution' })
	.use(authPlugin)
	.get('/context', ({ auth }) => activeAccount(auth))
	.put(
		'/identity',
		async ({ auth, body }) => {
			const user = await activeAccount(auth);
			if (user.role !== 'admin')
				throw new ForbiddenError(
					'Apenas administradores podem configurar a instituição.',
				);
			const clean = Object.fromEntries(
				Object.entries(body).map(([k, v]) => [k, v.trim()]),
			) as typeof body;
			return prisma.$transaction(async (tx) => {
				await tx.institution.update({
					where: { id: user.campus.institutionId },
					data: {
						name: clean.institutionName,
						acronym: clean.acronym,
						configured: true,
					},
				});
				await tx.campus.update({
					where: { id: user.campusId },
					data: {
						name: clean.campusName,
						city: clean.city,
						state: clean.state,
						address: clean.address,
					},
				});
				return { success: true };
			});
		},
		{
			body: t.Object({
				institutionName: t.String({
					minLength: 3,
					maxLength: 200,
					pattern: '\\S',
				}),
				acronym: t.String({ minLength: 2, maxLength: 30, pattern: '\\S' }),
				campusName: t.String({ minLength: 2, maxLength: 150, pattern: '\\S' }),
				city: t.String({ minLength: 2, maxLength: 100, pattern: '\\S' }),
				state: t.String({ pattern: '^[A-Z]{2}$' }),
				address: t.String({ minLength: 5, maxLength: 300, pattern: '\\S' }),
			}),
		},
	);
