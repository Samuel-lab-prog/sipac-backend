import { prisma } from '@Prisma';
import { studentDashboardPlanSelect } from './student-dashboard-selects';
import type {
	StudentProfileCreateInput,
	StudentProfileUpdateInput,
} from '../../../../generic-subdomains/persistance/prisma/generated/models/StudentProfile';
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
			data: profile as unknown as StudentProfileCreateInput,
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
							comments: {
								orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
								select: {
									id: true,
									submissionId: true,
									authorUserId: true,
									author: { select: { name: true } },
									body: true,
									createdAt: true,
									updatedAt: true,
								},
							},
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
						where: { status: { in: ['active', 'completed'] } },
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
									academicPeriod: {
										select: {
											id: true,
											code: true,
											year: true,
											term: true,
											startsAt: true,
											endsAt: true,
										},
									},
									teachingAssignments: {
										select: {
											professorProfile: {
												select: { id: true, user: { select: { name: true } } },
											},
										},
									},
									coursePlan: {
										where: { status: 'published' },
										select: studentDashboardPlanSelect,
									},
									activities: {
										orderBy: [{ dueAt: 'asc' }, { id: 'asc' }],
										select: {
											id: true,
											title: true,
											description: true,
											dueAt: true,
											allowLateSubmissions: true,
											kind: true,
											assessmentType: true,
											appliesAt: true,
											maxGrade: true,
											weight: true,
											coursePlanUnitId: true,
											coursePlanTopicId: true,
											classSessionId: true,
											attachments: {
												select: { id: true, fileName: true, fileUrl: true },
											},
											createdAt: true,
										},
									},
									sessions: {
										orderBy: [{ startsAt: 'asc' }],
										select: {
											id: true,
											coursePlanTopicId: true,
											startsAt: true,
											status: true,
											deliveredContent: true,
											room: true,
											publicNotes: true,
											replacesSessionId: true,
											materials: {
												select: { id: true, title: true, url: true },
											},
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
			.then((record) => {
				if (!record) return null;
				const {
					user,
					course,
					activitySubmissions,
					attendanceRecords,
					enrollments,
					...profile
				} = record;
				return {
					profile,
					userName: user.name,
					courseLevel: course?.level ?? null,
					attendanceSummary: buildAttendanceSummary(attendanceRecords),
					submissions: activitySubmissions.map((submission) => ({
						id: submission.id,
						activityId: submission.activityId,
						submittedAt: submission.submittedAt,
						grade: submission.grade?.toString() ?? null,
						feedback: submission.feedback,
						attachments: submission.attachments,
						comments: submission.comments.map((comment) => ({
							id: comment.id,
							submissionId: comment.submissionId,
							authorUserId: comment.authorUserId,
							authorName: comment.author.name,
							body: comment.body,
							createdAt: comment.createdAt,
							updatedAt: comment.updatedAt,
						})),
					})),
					enrollments: enrollments.map((enrollment) => ({
						id: enrollment.id,
						status: enrollment.status,
						classOffering: {
							id: enrollment.classOffering.id,
							title: enrollment.classOffering.title,
							code: enrollment.classOffering.code,
							year: enrollment.classOffering.year,
							term: enrollment.classOffering.term,
							shift: enrollment.classOffering.shift,
							courseId: enrollment.classOffering.courseId,
							academicPeriod: enrollment.classOffering.academicPeriod,
							professors: enrollment.classOffering.teachingAssignments.map(
								({ professorProfile }) => ({
									id: professorProfile.id,
									name: professorProfile.user.name,
								}),
							),
						},
						activities: enrollment.classOffering.activities.map((activity) => ({
							...activity,
							id: activity.id,
							title: activity.title,
							description: activity.description,
							dueAt: activity.dueAt,
							allowLateSubmissions: activity.allowLateSubmissions,
							createdAt: activity.createdAt,
						})),
						sessions: enrollment.classOffering.sessions,
						plan: enrollment.classOffering.coursePlan,
					})),
				};
			}),
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
			data: params as unknown as StudentProfileUpdateInput,
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
