import { prisma } from '@Prisma';
import { withPrismaResult } from '@PrismaErrorHandler';
import type { CommandResult } from '@SharedKernel/types';
import type { AttendanceRecord } from '../../ports/models';
import type {
	AttendanceCommandsRepository,
	MarkAttendanceBatchParams,
} from '../../ports/commands';

export function markAttendance(params: {
	classSessionId: number;
	studentProfileId: number;
	status: string;
	markedByProfessorProfileId: number | null;
}): Promise<CommandResult<AttendanceRecord>> {
	return withPrismaResult(() =>
		prisma.attendanceRecord.upsert({
			where: {
				classSessionId_studentProfileId: {
					classSessionId: params.classSessionId,
					studentProfileId: params.studentProfileId,
				},
			},
			create: params,
			update: {
				status: params.status,
				markedByProfessorProfileId: params.markedByProfessorProfileId,
			},
		}),
	);
}

export function markAttendanceBatch(
	params: MarkAttendanceBatchParams,
): Promise<CommandResult<AttendanceRecord[]>> {
	return withPrismaResult(async () => {
		const records = await Promise.all(
			params.attendances.map((attendance) =>
				prisma.attendanceRecord.upsert({
					where: {
						classSessionId_studentProfileId: {
							classSessionId: params.classSessionId,
							studentProfileId: attendance.studentProfileId,
						},
					},
					create: {
						classSessionId: params.classSessionId,
						studentProfileId: attendance.studentProfileId,
						status: attendance.status,
						markedByProfessorProfileId: params.targetUserId,
					},
					update: {
						status: attendance.status,
						markedByProfessorProfileId: params.targetUserId,
					},
				}),
			),
		);
		return records;
	});
}

export const commandsRepository: AttendanceCommandsRepository = {
	markAttendance,
	markAttendanceBatch,
};

export const queriesRepository = {};
