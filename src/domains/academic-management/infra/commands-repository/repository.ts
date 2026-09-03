import { prisma } from '@Prisma';
/* eslint-disable max-lines -- dashboard persistence and mapping are intentionally colocated. */
import { withPrismaErrorHandling, withPrismaResult } from '@PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/types';
import type {
	ProfessorProfile,
	StaffProfile,
	StudentProfile,
} from '../../ports/models';
import type { AcademicCommandsRepository } from '../../ports/commands';
import type {
	AcademicQueriesRepository,
	StudentDashboardAttendanceSummary,
	StudentDashboard,
} from '../../ports/queries';

export function insertStudentProfile(
	profile: Omit<StudentProfile, 'id'>,
): Promise<CommandResult<StudentProfile>> {
	return withPrismaResult(() =>
		prisma.studentProfile.create({
			data: profile,
		}),
	);
}

export function selectLastStudentAcademicId() {
	return withPrismaErrorHandling(() =>
		prisma.studentProfile.findFirst({
			orderBy: { academicId: 'desc' },
			select: { academicId: true },
		}),
	).then((profile) => profile?.academicId ?? null);
}

export function selectStudentProfileByUserId(userId: number) {
	return withPrismaErrorHandling(() =>
		prisma.studentProfile.findUnique({
			where: { userId },
		}),
	);
}

export function insertProfessorProfile(
	profile: Omit<ProfessorProfile, 'id'>,
): Promise<CommandResult<ProfessorProfile>> {
	return withPrismaResult(() =>
		prisma.professorProfile.create({
			data: profile,
		}),
	);
}

export function selectProfessorProfileByUserId(userId: number) {
	return withPrismaErrorHandling(() =>
		prisma.professorProfile.findUnique({
			where: { userId },
		}),
	);
}

export function insertStaffProfile(
	profile: Omit<StaffProfile, 'id'>,
): Promise<CommandResult<StaffProfile>> {
	return withPrismaResult(() =>
		prisma.staffProfile.create({
			data: profile,
		}),
	);
}

export function selectStaffProfileByUserId(userId: number) {
	return withPrismaErrorHandling(() =>
		prisma.staffProfile.findUnique({
			where: { userId },
		}),
	);
}

// eslint-disable-next-line max-lines-per-function
export function selectStudentDashboardByUserId(
	userId: number,
): Promise<StudentDashboard | null> {
	/* eslint-disable max-lines-per-function, max-nested-callbacks -- dashboard mapping is kept together with its query contract. */
	return withPrismaErrorHandling(() =>
		prisma.studentProfile
			.findUnique({
				where: { userId },
				include: {
					user: {
						select: {
							name: true,
						},
					},
					course: {
						select: {
							name: true,
							code: true,
							level: true,
						},
					},
					activitySubmissions: {
						orderBy: [{ submittedAt: 'desc' }, { id: 'desc' }],
						select: {
							id: true,
							activityId: true,
							submittedAt: true,
							grade: true,
							feedback: true,
							attachments: true,
						},
					},
					attendanceRecords: {
						orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
						select: {
							id: true,
							status: true,
						},
					},
					enrollments: {
						where: { status: 'active' },
						orderBy: [{ createdAt: 'asc' }],
						include: {
							classOffering: {
								select: {
									id: true,
									title: true,
									code: true,
									year: true,
									term: true,
									shift: true,
									courseId: true,
									activities: {
										orderBy: [{ dueAt: 'asc' }, { id: 'asc' }],
										select: {
											id: true,
											title: true,
											description: true,
											dueAt: true,
											allowLateSubmissions: true,
											createdAt: true,
										},
									},
									sessions: {
										orderBy: [{ startsAt: 'asc' }],
										select: {
											id: true,
											startsAt: true,
											endsAt: true,
											topic: true,
										},
									},
								},
							},
						},
					},
				},
			})
			.then((profile) =>
				profile
					? {
							profile,
							userName: profile.user.name,
							courseLevel: profile.course?.level ?? null,
							attendanceSummary: buildAttendanceSummary(
								profile.attendanceRecords,
							),
							submissions: profile.activitySubmissions.map((submission) => ({
								id: submission.id,
								activityId: submission.activityId,
								submittedAt: submission.submittedAt,
								grade: submission.grade?.toString() ?? null,
								feedback: submission.feedback,
								attachments: submission.attachments,
							})),
							enrollments: profile.enrollments.map((enrollment) => ({
								id: enrollment.id,
								status: enrollment.status,
								classOffering: enrollment.classOffering,
								activities: enrollment.classOffering.activities.map(
									(activity) => ({
										id: activity.id,
										title: activity.title,
										description: activity.description,
										dueAt: activity.dueAt,
										allowLateSubmissions: activity.allowLateSubmissions,
										createdAt: activity.createdAt,
									}),
								),
								sessions: enrollment.classOffering.sessions,
							})),
						}
					: null,
			),
	);
}

function buildAttendanceSummary(
	attendanceRecords: Array<{
		id: number;
		status: string;
	}>,
): StudentDashboardAttendanceSummary {
	if (attendanceRecords.length === 0) {
		return {
			totalRecords: 0,
			presentRecords: 0,
			percentage: 0,
		};
	}

	const presentRecords = attendanceRecords.filter(
		(record) => record.status === 'present',
	).length;

	return {
		totalRecords: attendanceRecords.length,
		presentRecords,
		percentage: Math.round((presentRecords / attendanceRecords.length) * 100),
	};
}

export function updateStudentProfile(
	userId: number,
	params: Partial<Omit<StudentProfile, 'id' | 'userId'>>,
): Promise<CommandResult<StudentProfile>> {
	return withPrismaResult(() =>
		prisma.studentProfile.update({
			where: { userId },
			data: params,
		}),
	);
}

export function updateProfessorProfile(
	userId: number,
	params: Partial<Omit<ProfessorProfile, 'id' | 'userId'>>,
): Promise<CommandResult<ProfessorProfile>> {
	return withPrismaResult(() =>
		prisma.professorProfile.update({
			where: { userId },
			data: params,
		}),
	);
}

export function updateStaffProfile(
	userId: number,
	params: Partial<Omit<StaffProfile, 'id' | 'userId'>>,
): Promise<CommandResult<StaffProfile>> {
	return withPrismaResult(() =>
		prisma.staffProfile.update({
			where: { userId },
			data: params,
		}),
	);
}

export function linkStudentToCourse(
	userId: number,
	params: Pick<StudentProfile, 'courseId'>,
): Promise<CommandResult<StudentProfile>> {
	return updateStudentProfile(userId, params);
}

export function linkProfessorToDepartment(
	userId: number,
	params: Pick<ProfessorProfile, 'departmentId'>,
): Promise<CommandResult<ProfessorProfile>> {
	return updateProfessorProfile(userId, params);
}

export function unlinkStudentFromCourse(
	userId: number,
): Promise<CommandResult<StudentProfile>> {
	return updateStudentProfile(userId, { courseId: null });
}

export function unlinkProfessorFromDepartment(
	userId: number,
): Promise<CommandResult<ProfessorProfile>> {
	return updateProfessorProfile(userId, { departmentId: null });
}

export const commandsRepository: AcademicCommandsRepository = {
	selectLastStudentAcademicId,
	insertStudentProfile,
	createProfessorProfile: insertProfessorProfile,
	createStaffProfile: insertStaffProfile,
	updateStudentProfile,
	updateProfessorProfile,
	updateStaffProfile,
	linkStudentToCourse,
	linkProfessorToDepartment,
	unlinkStudentFromCourse,
	unlinkProfessorFromDepartment,
};

export const queriesRepository: AcademicQueriesRepository = {
	selectStudentProfileByUserId,
	selectProfessorProfileByUserId,
	selectStaffProfileByUserId,
	selectStudentDashboardByUserId,
};
