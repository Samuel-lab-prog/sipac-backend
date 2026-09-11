import { Elysia, t } from 'elysia';
import { authPlugin } from '@GenericSubdomains/authentication/composition';
import { appErrorSchema } from '@AppError';
import { professorFor } from './access';
import * as query from './queries';
import * as write from './writes';
import * as records from './roster';
import * as s from './schemas';

const errors = { 401: appErrorSchema, 403: appErrorSchema, 404: appErrorSchema, 409: appErrorSchema, 422: appErrorSchema };
const written = { 200: s.success, ...errors };
const identified = { 200: t.Object({ id: t.Number() }), ...errors };
const childParams = t.Object({ classId: s.id, id: s.id });

export const teachingRouter = new Elysia({ prefix: '/teaching' })
	.use(authPlugin)
	.resolve(async ({ auth }) => ({ professorId: await professorFor(auth) }))
	.get('/overview', ({ professorId }) => query.overview(professorId), { response: { 200: t.Object({ profile: t.Object({ registryCode: t.Nullable(t.String()), title: t.Nullable(t.String()), workload: t.Nullable(t.Number()), department: t.Nullable(t.Object({ name: t.String() })), user: t.Object({ name: t.String(), email: t.String() }) }), classCount: t.Number(), students: t.Number(), pendingGrades: t.Number(), lessons: t.Array(s.lessonSchema) }), ...errors } })
	.get('/classes', ({ professorId, query: filters }) => query.classes(professorId, filters), { query: s.listQuery, response: { 200: s.pageOf(s.classSchema), ...errors } })
	.get('/classes/:classId', ({ professorId, params }) => query.detail(professorId, params.classId), { params: s.classParams, response: { 200: t.Object({ ...s.classSchema.properties, coursePlan: t.Nullable(s.planSchema) }), ...errors } })
	.get('/lessons', ({ professorId, query: filters }) => query.lessons(professorId, filters), { query: s.sessionQuery, response: { 200: s.pageOf(s.lessonSchema), ...errors } })
	.get('/activities', ({ professorId, query: filters }) => query.activities(professorId, filters), { query: s.listQuery, response: { 200: s.pageOf(s.activitySchema), ...errors } })
	.get('/materials', ({ professorId, query: filters }) => query.materials(professorId, filters), { query: s.listQuery, response: { 200: s.pageOf(t.Object({ ...s.materialSchema.properties, classSessionId: t.Number(), classSession: t.Object({ topic: t.Nullable(t.String()), classOfferingId: t.Number(), classOffering: t.Object({ title: t.String() }) }) })), ...errors } })
	.get('/classes/:classId/roster', ({ professorId, params, query: filters }) => records.roster(professorId, params.classId, filters), { params: s.classParams, query: t.Object({ ...s.pageFields, lessonId: t.Optional(s.id), activityId: t.Optional(s.id) }), response: { 200: s.pageOf(s.rosterSchema), ...errors } })
	.put('/classes/:classId/plan', ({ professorId, params, body }) => write.savePlan(professorId, params.classId, body), { params: s.classParams, body: s.planBody, response: written })
	.post('/classes/:classId/plan/units', ({ professorId, params, body }) => write.addUnit(professorId, params.classId, body), { params: s.classParams, body: s.unitBody, response: written })
	.post('/classes/:classId/lessons', ({ professorId, params, body }) => write.saveLesson(professorId, params.classId, body), { params: s.classParams, body: s.lessonBody, response: identified })
	.put('/classes/:classId/lessons/:id', ({ professorId, params, body }) => write.saveLesson(professorId, params.classId, body, params.id), { params: childParams, body: s.lessonBody, response: identified })
	.post('/lessons/:id/materials', ({ professorId, params, body }) => write.addMaterial(professorId, params.id, body), { params: s.itemParams, body: s.materialBody, response: written })
	.put('/lessons/:id/attendance', ({ professorId, params, body }) => records.markAttendance(professorId, params.id, body), { params: s.itemParams, body: s.attendanceBody, response: written })
	.post('/classes/:classId/activities', ({ professorId, params, body }) => write.saveActivity(professorId, params.classId, body), { params: s.classParams, body: s.activityBody, response: identified })
	.put('/classes/:classId/activities/:id', ({ professorId, params, body }) => write.saveActivity(professorId, params.classId, body, params.id), { params: childParams, body: s.activityBody, response: identified })
	.put('/activities/:id/grade', ({ professorId, params, body }) => records.grade(professorId, params.id, body), { params: s.itemParams, body: s.gradeBody, response: written });
