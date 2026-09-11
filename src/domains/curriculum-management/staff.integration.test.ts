import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { prisma } from '@Prisma';
import { ErrorPlugin } from '../../generic-subdomains/utils/error-handling/error-plugin/util';
import { JwtTokenService } from '../../generic-subdomains/authentication/infra/jwt-token-service/jwt-token-service';
import { runStudentSeeds } from '../../generic-subdomains/persistance/seed/index';
import type { StudentDashboard } from '../academic-management/ports/queries';
import { academicQueriesRouter } from '../academic-management/composition';
import { curriculumCommandsRouter, curriculumStaffRouter } from './composition';

describe.skipIf(process.env.NODE_ENV !== 'test')(
	'INTEGRATION staff class management',
	() => {
		const app = new Elysia()
			.use(ErrorPlugin)
			.use(curriculumCommandsRouter)
			.use(curriculumStaffRouter)
			.use(academicQueriesRouter);
		const createdIds: number[] = [];
		const prefix = `TEST-STAFF-${Date.now()}`;
		let courseId: number;
		let periodId: number;
		let studentId: number;
		let professorId: number;
		const cookies: Record<string, string> = {};
		let staffUserId: number;
		beforeAll(async () => {
			await runStudentSeeds(prisma, []);
			for (const role of ['staff', 'admin', 'professor', 'student'] as const) {
				const user = await prisma.user.findFirstOrThrow({
					where: {
						role,
						email: { endsWith: '@dev.agias.example' },
						...(role === 'student'
							? { email: 'student.empty@dev.agias.example' }
							: {}),
					},
				});
				cookies[role] =
					`token=${JwtTokenService.generateToken({ clientId: user.id, email: user.email, role, tokenType: 'access' }, 600)}`;
				if (role === 'staff') staffUserId = user.id;
				if (role === 'student')
					studentId = (
						await prisma.studentProfile.findUniqueOrThrow({
							where: { userId: user.id },
						})
					).id;
				if (role === 'professor')
					professorId = (
						await prisma.professorProfile.findUniqueOrThrow({
							where: { userId: user.id },
						})
					).id;
			}
			const offering = await prisma.classOffering.findFirstOrThrow({
				where: { code: { startsWith: 'DEV-AGIAS-REFERENCE' } },
			});
			courseId = offering.courseId;
			periodId = offering.academicPeriodId;
		}, 60_000);
		afterAll(async () => {
			await prisma.classOffering.deleteMany({
				where: { id: { in: createdIds }, code: { startsWith: prefix } },
			});
			await runStudentSeeds(prisma, ['--clean']);
			await prisma.$disconnect();
		});
		function request(
			path: string,
			role = 'staff',
			method = 'GET',
			body?: unknown,
		) {
			return app.handle(
				new Request(`http://localhost${path}`, {
					method,
					headers: {
						cookie: cookies[role] ?? '',
						...(body ? { 'content-type': 'application/json' } : {}),
					},
					body: body ? JSON.stringify(body) : undefined,
				}),
			);
		}
		async function createClass(suffix: string) {
			const response = await request(
				'/curriculum/class-offerings',
				'staff',
				'POST',
				{
					courseId,
					academicPeriodId: periodId,
					shift: 'morning',
					term: 'ignored',
					year: 2000,
					code: `${prefix}-${suffix}`,
					title: 'Turma criada pelo staff',
				},
			);
			expect(response.status).toBe(201);
			const data = (await response.json()) as {
				id: number;
				year: number;
				term: string;
			};
			createdIds.push(data.id);
			expect(
				(await request(`/curriculum/class-offerings/${data.id}`)).status,
			).toBe(200);
			expect(data.year).toBe(2026);
			expect(data.term).toBe('2');
			return data.id;
		}
		it('restricts administrative reads and writes to active staff and admin', async () => {
			for (const role of ['student', 'professor']) {
				expect(
					(await request('/curriculum/class-offerings', role)).status,
				).toBe(403);
				expect((await request('/curriculum/students', role)).status).toBe(403);
				expect(
					(
						await request(
							'/curriculum/class-offerings/1/enrollments',
							role,
							'POST',
							{ studentProfileId: studentId },
						)
					).status,
				).toBe(403);
				expect(
					(
						await request('/curriculum/class-offerings', role, 'POST', {
							courseId,
							academicPeriodId: periodId,
							shift: 'morning',
							term: '2',
							year: 2026,
							code: `${prefix}-FORBIDDEN`,
							title: 'Não criar',
						})
					).status,
				).toBe(403);
			}
			expect(
				(await request('/curriculum/class-offerings', 'admin')).status,
			).toBe(200);
			expect(
				(await request('/curriculum/class-offerings', 'guest')).status,
			).not.toBe(200);
		});
		it('rechecks the staff account status instead of trusting the token role alone', async () => {
			await prisma.user.update({
				where: { id: staffUserId },
				data: { status: 'pending' },
			});
			try {
				expect((await request('/curriculum/class-offerings')).status).toBe(401);
				expect(
					(
						await request(
							'/curriculum/class-offerings/1/enrollments',
							'staff',
							'POST',
							{ studentProfileId: studentId },
						)
					).status,
				).toBe(401);
			} finally {
				await prisma.user.update({
					where: { id: staffUserId },
					data: { status: 'active' },
				});
			}
		});
		it('creates and edits a class, links a professor, enrolls once and preserves history on cancellation/reactivation', async () => {
			const id = await createClass('CYCLE');
			expect(
				(
					await request(`/curriculum/class-offerings/${id}`, 'staff', 'PUT', {
						title: 'Programação Web II — staff',
						code: `${prefix}-CYCLE`,
						shift: 'afternoon',
					})
				).status,
			).toBe(200);
			expect(
				(
					await request(
						`/curriculum/class-offerings/${id}/professors`,
						'staff',
						'POST',
						{ professorProfileId: professorId },
					)
				).status,
			).toBe(200);
			const enrolled = await request(
				`/curriculum/class-offerings/${id}/enrollments`,
				'staff',
				'POST',
				{ studentProfileId: studentId },
			);
			expect(enrolled.status).toBe(201);
			const enrollment = (await enrolled.json()) as { id: number };
			expect(
				(await request(`/curriculum/class-offerings/${id}/enrollments`)).status,
			).toBe(200);
			expect(
				(
					await request(
						`/curriculum/class-offerings/${id}/enrollments`,
						'staff',
						'POST',
						{ studentProfileId: studentId },
					)
				).status,
			).toBe(409);
			const dashboard = (await (
				await request('/academic/students/dashboard/me', 'student')
			).json()) as StudentDashboard;
			const visible = dashboard.enrollments.find(
				(item: { classOffering: { id: number } }) =>
					item.classOffering.id === id,
			);
			expect(visible!.classOffering.title).toBe('Programação Web II — staff');
			expect(visible!.classOffering.professors![0]!.id).toBe(professorId);
			for (const status of ['cancelled', 'active', 'completed']) {
				const response = await request(
					`/curriculum/class-offerings/${id}/enrollments/${enrollment.id}`,
					'staff',
					'PATCH',
					{ status },
				);
				expect(response.status).toBe(200);
				expect(((await response.json()) as { id: number }).id).toBe(
					enrollment.id,
				);
				const current = (await (
					await request('/academic/students/dashboard/me', 'student')
				).json()) as StudentDashboard;
				expect(
					current.enrollments.some(
						(item: { id: number }) => item.id === enrollment.id,
					),
				).toBe(status !== 'cancelled');
			}
			const other = await createClass('OTHER');
			expect(
				(
					await request(
						`/curriculum/class-offerings/${other}/enrollments/${enrollment.id}`,
						'staff',
						'PATCH',
						{ status: 'cancelled' },
					)
				).status,
			).toBe(404);
			expect(
				await prisma.enrollment.count({
					where: { studentProfileId: studentId, classOfferingId: id },
				}),
			).toBe(1);
		});
		it('validates identifiers and states and keeps the class list paginated and free of personal documents', async () => {
			expect((await request('/curriculum/class-offerings?page=0')).status).toBe(
				422,
			);
			expect((await request('/curriculum/class-offerings/0')).status).toBe(422);
			expect(
				(
					await request(
						`/curriculum/class-offerings/${createdIds[0]}/enrollments/1`,
						'staff',
						'PATCH',
						{ status: 'unknown' },
					)
				).status,
			).toBe(422);
			const list = (await (
				await request(`/curriculum/class-offerings?q=${prefix}`)
			).json()) as { items: unknown[]; pageSize: number };
			expect(list.items.length).toBe(2);
			expect(list.pageSize).toBe(25);
			const students = (await (
				await request('/curriculum/students')
			).json()) as { items: Record<string, unknown>[] };
			expect(students.items.length).toBeLessThanOrEqual(25);
			for (const student of students.items)
				expect(Object.keys(student).sort()).toEqual([
					'academicId',
					'courseId',
					'id',
					'name',
				]);
		});
	},
);
