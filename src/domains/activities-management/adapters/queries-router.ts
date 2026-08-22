import { appErrorSchema } from '@AppError';
import { Elysia, t } from 'elysia';
import type { ActivitiesQueriesServices } from '../ports/queries';
import {
	academicActivitySchema,
	academicActivitySubmissionSchema,
} from '../ports/schemas';

export function createActivitiesQueriesRouter(
	services: ActivitiesQueriesServices,
) {
	return new Elysia({ prefix: '/activities' })
		.get(
			'/class-offerings/:classOfferingId',
			({ params }) =>
				services.listAcademicActivitiesByClassOfferingId(
					Number(params.classOfferingId),
				),
			{
				params: t.Object({ classOfferingId: t.Numeric() }),
				response: {
					200: t.Array(academicActivitySchema),
					404: appErrorSchema,
				},
				detail: {
					summary: 'List Academic Activities By Class Offering',
					tags: ['Activities Management'],
				},
			},
		)
		.get(
			'/students/:studentProfileId/submissions',
			({ params }) =>
				services.listAcademicActivitySubmissionsByStudentProfileId(
					Number(params.studentProfileId),
				),
			{
				params: t.Object({ studentProfileId: t.Numeric() }),
				response: {
					200: t.Array(academicActivitySubmissionSchema),
					404: appErrorSchema,
				},
				detail: {
					summary: 'List Academic Activity Submissions By Student',
					tags: ['Activities Management'],
				},
			},
		);
}
