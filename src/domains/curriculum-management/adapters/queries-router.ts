import { Elysia } from 'elysia';
import { prisma } from '@Prisma';
import { t } from 'elysia';

const academicPeriodSchema = t.Object({
	id: t.Number(),
	code: t.String(),
	year: t.Number(),
	term: t.Number(),
	startsAt: t.Date(),
	endsAt: t.Date(),
});

export function createCurriculumQueriesRouter() {
	return new Elysia({ prefix: '/curriculum' }).get(
		'/academic-periods',
		() =>
			prisma.academicPeriod.findMany({
				orderBy: [{ year: 'desc' }, { term: 'desc' }],
			}),
		{
			response: { 200: t.Array(academicPeriodSchema) },
			detail: {
				summary: 'List Academic Periods',
				tags: ['Curriculum Management'],
			},
		},
	);
}
