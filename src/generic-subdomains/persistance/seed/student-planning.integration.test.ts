import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { prisma } from '../prisma/prisma-client';
import { runStudentSeeds } from './index';
import { selectStudentDashboardByUserId } from '../../../domains/academic-management/infra/commands-repository/repository';
import { listEventsForStudent } from '../../../domains/academic-calendar-management/infra/queries-repository/repository';
import { userQueriesRouter } from '../../../domains/users-management/composition';
import { JwtTokenService } from '../../authentication/infra/jwt-token-service/jwt-token-service';

describe.skipIf(process.env.NODE_ENV !== 'test')(
	'INTEGRATION student planning',
	() => {
		beforeAll(async () => {
			await runStudentSeeds(prisma, []);
		}, 60_000);
		afterAll(async () => {
			await runStudentSeeds(prisma, ['--clean']);
			await prisma.$disconnect();
		});
		const userFor = (scenario: string) =>
			prisma.user.findUniqueOrThrow({
				where: { email: `student.${scenario}@dev.agias.example` },
			});
		it('returns each dashboard collection once and only the student plan fields', async () => {
			const user = await userFor('reference');
			const data = await selectStudentDashboardByUserId(user.id);
			const profile = await prisma.studentProfile.findUniqueOrThrow({
				where: { userId: user.id },
			});
			expect(data!.profile).toEqual(profile);
			expect(data!.enrollments).toHaveLength(13);
			expect(data!.submissions.length).toBeGreaterThan(0);
			const plan = data!.enrollments[0]!.plan!;
			expect(plan).not.toHaveProperty('createdAt');
			expect(plan).not.toHaveProperty('classOfferingId');
			expect(plan.units[0]).not.toHaveProperty('coursePlanId');
			expect(plan.units[0]!.topics[0]).not.toHaveProperty('coursePlanUnitId');
			// Regression budget for the full reference semester, including lessons and submissions.
			expect(Buffer.byteLength(JSON.stringify(data))).toBeLessThan(256 * 1024);
		});
		it('serves valid authenticated profiles for every seeded role and scenario', async () => {
			const users = await prisma.user.findMany({
				where: {
					email: { endsWith: '@dev.agias.example' },
					nickname: { startsWith: 'dev.agias.' },
				},
				select: { id: true, role: true, email: true, rg: true },
			});
			expect(users.length).toBeGreaterThanOrEqual(44);
			expect(new Set(users.map((user) => user.rg)).size).toBe(users.length);
			for (const user of users) {
				const token = JwtTokenService.generateToken(
					{
						clientId: user.id,
						role: user.role,
						email: user.email,
						tokenType: 'access',
					},
					60,
				);
				const response = await userQueriesRouter.handle(
					new Request('http://localhost/users/me', {
						headers: { cookie: `token=${token}` },
					}),
				);
				expect(response.status).toBe(200);
				const profile = (await response.json()) as { id: number; rg: string };
				expect(profile.id).toBe(user.id);
				expect(profile.rg).toMatch(/^\d{5,20}$/);
				expect(profile).not.toHaveProperty('passwordHash');
			}
		});
		it('executes the real dashboard select and supplies lesson, material and assessment contracts', async () => {
			const user = await userFor('complete');
			const data = await selectStudentDashboardByUserId(user.id);
			expect(data!.enrollments).toHaveLength(3);
			const enrollment = data!.enrollments[0]!;
			expect(enrollment.classOffering.academicPeriod?.code).toBe('2026.2');
			expect(enrollment.classOffering.professors?.length).toBe(1);
			expect(
				enrollment.sessions.some((session) => session.status === 'cancelled'),
			).toBe(true);
			expect(
				enrollment.sessions.some((session) => session.replacesSessionId),
			).toBe(true);
			expect(
				enrollment.sessions.some((session) => session.materials?.length),
			).toBe(true);
			expect(
				enrollment.activities.some(
					(activity) => activity.kind === 'assessment' && activity.appliesAt,
				),
			).toBe(true);
		});
		it('retains completed enrollments and handles the empty student', async () => {
			const semester = await userFor('semester');
			const empty = await userFor('empty');
			expect(
				(await selectStudentDashboardByUserId(semester.id))!.enrollments.some(
					(item) => item.status === 'completed',
				),
			).toBe(true);
			expect(
				(await selectStudentDashboardByUserId(empty.id))!.enrollments,
			).toHaveLength(0);
		});
		it('creates the 2026 reference cohort with every catalog subject', async () => {
			const referenceStudent = await userFor('reference');
			const data = await selectStudentDashboardByUserId(referenceStudent.id);
			expect(referenceStudent.cpf).toBe('99010000001');
			expect(data!.enrollments).toHaveLength(13);
			expect(data!.enrollments.map((item) => item.classOffering.title)).toEqual(
				[
					'Arte Educação',
					'Design para Web',
					'Empreendedorismo em Informática',
					'Filosofia IV',
					'Geografia II',
					'Inglês IV',
					'Legislação Aplicada à Informática',
					'Língua Estrangeira - Espanhol II',
					'Língua Portuguesa e Literatura IV',
					'Matemática IV',
					'Programação Web II',
					'Redes de Computadores',
					'Sociologia IV',
				],
			);
			expect(
				data!.enrollments.every((item) => item.plan?.status === 'published'),
			).toBe(true);
			expect(
				data!.enrollments.every((item) =>
					item.sessions.some((session) => session.materials?.length),
				),
			).toBe(true);
		});
		it('does not leak a draft plan through the dashboard payload', async () => {
			const user = await userFor('exceptions');
			const data = await selectStudentDashboardByUserId(user.id);
			expect(data!.enrollments.every((item) => item.plan === null)).toBe(true);
			expect(
				data!.enrollments.every(
					(item) => !item.classOffering.professors?.length,
				),
			).toBe(true);
			expect(JSON.stringify(data)).not.toContain('"status":"draft"');
		});
		it('selects an overlapping academic event even when it starts before the requested window', async () => {
			const user = await userFor('complete');
			const events = await listEventsForStudent({
				userId: user.id,
				from: new Date('2026-10-21T00:00:00-03:00'),
				to: new Date('2026-10-22T00:00:00-03:00'),
			});
			expect(
				events.some((event) => event.title === '[DEV-AGIAS] Semana acadêmica'),
			).toBe(true);
		});
		it('reruns without duplicates and preserves historical sessions', async () => {
			const user = await userFor('complete');
			const data = await selectStudentDashboardByUserId(user.id);
			const classOfferingId = data!.enrollments[0]!.classOffering.id;
			const historical = await prisma.classSession.create({
				data: {
					classOfferingId,
					startsAt: new Date('2025-01-02T10:00:00Z'),
					topic: 'Historical content that must survive seeds',
				},
			});
			const counts = async () =>
				Promise.all([
					prisma.classOffering.count(),
					prisma.classSession.count(),
					prisma.coursePlanTopic.count(),
					prisma.academicActivity.count(),
					prisma.academicCalendarEvent.count(),
					prisma.user.count(),
				]);
			const before = await counts();
			await runStudentSeeds(prisma, []);
			expect(await counts()).toEqual(before);
			expect(
				(
					await prisma.classSession.findUniqueOrThrow({
						where: { id: historical.id },
					})
				).topic,
			).toBe(historical.topic);
		}, 60_000);
	},
);
