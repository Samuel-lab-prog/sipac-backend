import {
	commandsRepository,
	queriesRepository,
} from './infra/commands-repository/repository';
import { storageService } from '@SharedKernel/infra/storage/storage-service';
import { createAcademicCommandsRouter } from './adapters/commands-router';
import { createAcademicQueriesRouter } from './adapters/queries-router';
import { createProfessorProfileFactory } from './use-cases/commands/create-professor-profile/execute';
import { createStaffProfileFactory } from './use-cases/commands/create-staff-profile/execute';
import { createStudentProfileFactory } from './use-cases/commands/create-student-profile/execute';
import { createAcademicPeriodFactory } from './use-cases/commands/create-academic-period/execute';
import { createAcademicActivityFactory } from './use-cases/commands/create-academic-activity/execute';
import { createAcademicActivitySubmissionFactory } from './use-cases/commands/create-academic-activity-submission/execute';
import { createAcademicActivityAttachmentUploadUrlFactory } from './use-cases/commands/create-academic-activity-attachment-upload-url/execute';
import { createClassOfferingFactory } from './use-cases/commands/create-class-offering/execute';
import { linkProfessorToDepartmentFactory } from './use-cases/commands/link-professor-to-department/execute';
import { linkStudentToCourseFactory } from './use-cases/commands/link-student-to-course/execute';
import { markAttendanceFactory } from './use-cases/commands/mark-attendance/execute';
import { markAttendanceBatchFactory } from './use-cases/commands/mark-attendance-batch/execute';
import { unlinkProfessorFromDepartmentFactory } from './use-cases/commands/unlink-professor-from-department/execute';
import { unlinkStudentFromCourseFactory } from './use-cases/commands/unlink-student-from-course/execute';
import { updateProfessorProfileFactory } from './use-cases/commands/update-professor-profile/execute';
import { updateStaffProfileFactory } from './use-cases/commands/update-staff-profile/execute';
import { updateStudentProfileFactory } from './use-cases/commands/update-student-profile/execute';
import { getProfessorProfileByUserIdFactory } from './use-cases/queries/get-professor-profile-by-user-id/execute';
import { getStaffProfileByUserIdFactory } from './use-cases/queries/get-staff-profile-by-user-id/execute';
import { getStudentProfileByUserIdFactory } from './use-cases/queries/get-student-profile-by-user-id/execute';

const createStudentProfile = createStudentProfileFactory({
	commandsRepository,
});
const createProfessorProfile = createProfessorProfileFactory({
	commandsRepository,
});
const createStaffProfile = createStaffProfileFactory({
	commandsRepository,
});
const createAcademicPeriod = createAcademicPeriodFactory({
	commandsRepository,
});
const createAcademicActivity = createAcademicActivityFactory({
	commandsRepository,
});
const createAcademicActivitySubmission =
	createAcademicActivitySubmissionFactory({
		commandsRepository,
	});
const createClassOffering = createClassOfferingFactory({
	commandsRepository,
});
const createAcademicActivityAttachmentUploadUrl =
	createAcademicActivityAttachmentUploadUrlFactory({
		storageService,
	});
const updateStudentProfile = updateStudentProfileFactory({
	commandsRepository,
});
const updateProfessorProfile = updateProfessorProfileFactory({
	commandsRepository,
});
const updateStaffProfile = updateStaffProfileFactory({
	commandsRepository,
});
const linkStudentToCourse = linkStudentToCourseFactory({
	commandsRepository,
});
const linkProfessorToDepartment = linkProfessorToDepartmentFactory({
	commandsRepository,
});
const unlinkStudentFromCourse = unlinkStudentFromCourseFactory({
	commandsRepository,
});
const unlinkProfessorFromDepartment = unlinkProfessorFromDepartmentFactory({
	commandsRepository,
});
const markAttendance = markAttendanceFactory({
	commandsRepository,
});
const markAttendanceBatch = markAttendanceBatchFactory({
	commandsRepository,
});

const getStudentProfileByUserId = getStudentProfileByUserIdFactory({
	queriesRepository,
});
const getProfessorProfileByUserId = getProfessorProfileByUserIdFactory({
	queriesRepository,
});
const getStaffProfileByUserId = getStaffProfileByUserIdFactory({
	queriesRepository,
});

export const academicCommandsRouter = createAcademicCommandsRouter({
	createStudentProfile,
	createProfessorProfile,
	createStaffProfile,
	createAcademicPeriod,
	createAcademicActivity,
	createAcademicActivitySubmission,
	createClassOffering,
	createAcademicActivityAttachmentUploadUrl,
	updateStudentProfile,
	updateProfessorProfile,
	updateStaffProfile,
	linkStudentToCourse,
	linkProfessorToDepartment,
	unlinkStudentFromCourse,
	unlinkProfessorFromDepartment,
	markAttendance,
	markAttendanceBatch,
});

export const academicQueriesRouter = createAcademicQueriesRouter({
	getStudentProfileByUserId,
	getProfessorProfileByUserId,
	getStaffProfileByUserId,
});
