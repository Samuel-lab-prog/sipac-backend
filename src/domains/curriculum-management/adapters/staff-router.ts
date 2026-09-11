import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { Elysia, t } from 'elysia';
import * as queries from '../infra/staff-queries';
import * as commands from '../infra/staff-writes';
import * as schema from '../ports/schemas/staff-schema';
import { classOfferingSchema } from '../ports/schemas/class-offering-schema';
import { assertCanManageCurriculum } from '../use-cases/commands/policies';

const errors = {
	401: appErrorSchema,
	403: appErrorSchema,
	404: appErrorSchema,
	409: appErrorSchema,
	422: appErrorSchema,
};
// Administrative reads deliberately exclude lesson plans, submissions and personal documents.
// eslint-disable-next-line max-lines-per-function -- cohesive route declarations with explicit schemas.
export function createCurriculumStaffRouter() {
	return new Elysia({ prefix: '/curriculum' })
		.use(authPlugin)
		.onBeforeHandle(({ auth }) => assertCanManageCurriculum(auth))
		.get('/courses', () => queries.listCourseOptions(), {
			response: { 200: t.Array(schema.courseOptionSchema), ...errors },
		})
		.get('/class-offerings', ({ query }) => queries.listStaffClasses(query), {
			query: schema.classListQuery,
			response: { 200: schema.classPageSchema, ...errors },
		})
		.get(
			'/class-offerings/:classId',
			({ params }) => queries.getStaffClass(params.classId),
			{
				params: schema.classParams,
				response: { 200: schema.classSummarySchema, ...errors },
			},
		)
		.put(
			'/class-offerings/:classId',
			({ params, body }) => commands.editStaffClass(params.classId, body),
			{
				params: schema.classParams,
				body: schema.editClassSchema,
				response: { 200: classOfferingSchema, ...errors },
			},
		)
		.get('/students', ({ query }) => queries.listStudentOptions(query), {
			query: schema.lookupQuery,
			response: { 200: schema.studentsPageSchema, ...errors },
		})
		.get('/professors', ({ query }) => queries.listProfessorOptions(query), {
			query: t.Object(schema.pageQuery),
			response: { 200: schema.professorsPageSchema, ...errors },
		})
		.get(
			'/class-offerings/:classId/enrollments',
			({ params, query }) => queries.listRoster(params.classId, query),
			{
				params: schema.classParams,
				query: t.Object(schema.pageQuery),
				response: { 200: schema.rosterPageSchema, ...errors },
			},
		)
		.post(
			'/class-offerings/:classId/enrollments',
			({ params, body, set }) => {
				set.status = 201;
				return commands.enrollStudent(params.classId, body.studentProfileId);
			},
			{
				params: schema.classParams,
				body: t.Object({ studentProfileId: schema.positiveId }),
				response: { 201: schema.enrollmentSchema, ...errors },
			},
		)
		.patch(
			'/class-offerings/:classId/enrollments/:enrollmentId',
			({ params, body }) =>
				commands.changeEnrollmentStatus(
					params.classId,
					params.enrollmentId,
					body.status,
				),
			{
				params: t.Object({
					classId: schema.positiveId,
					enrollmentId: schema.positiveId,
				}),
				body: schema.enrollmentStatusSchema,
				response: { 200: schema.enrollmentSchema, ...errors },
			},
		)
		.post(
			'/class-offerings/:classId/professors',
			({ params, body }) =>
				commands.assignProfessor(params.classId, body.professorProfileId),
			{
				params: schema.classParams,
				body: t.Object({ professorProfileId: schema.positiveId }),
				response: { 200: schema.professorOptionSchema, ...errors },
			},
		)
		.delete(
			'/class-offerings/:classId/professors/:professorId',
			({ params }) =>
				commands.unassignProfessor(params.classId, params.professorId),
			{
				params: t.Object({
					classId: schema.positiveId,
					professorId: schema.positiveId,
				}),
				response: { 200: t.Object({ success: t.Boolean() }), ...errors },
			},
		);
}
