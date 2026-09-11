import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { prisma } from '../prisma/prisma-client';
import { runStudentSeeds } from './index';
import { selectStudentDashboardByUserId } from '../../../domains/academic-management/infra/commands-repository/repository';
import { listEventsForStudent } from '../../../domains/academic-calendar-management/infra/queries-repository/repository';

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
