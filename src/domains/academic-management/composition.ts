import {
	commandsRepository,
	queriesRepository,
} from './infra/commands-repository/repository';
import { Elysia } from 'elysia';
import { storageService } from '@SharedKernel/infra/storage/storage-service';
import { createAcademicAttachmentCommandsRouter } from './adapters/attachment-commands-router';
import { createAcademicProfileCommandsRouter } from './adapters/profile-commands-router';
import { createAcademicRelationCommandsRouter } from './adapters/relation-commands-router';
import { createAcademicQueriesRouter } from './adapters/queries-router';
import { createProfessorProfileFactory } from './use-cases/commands/create-professor-profile/execute';
import { createStaffProfileFactory } from './use-cases/commands/create-staff-profile/execute';
import { createStudentProfileFactory } from './use-cases/commands/create-student-profile/execute';
import { createAcademicActivityAttachmentUploadUrlFactory } from './use-cases/commands/create-academic-activity-attachment-upload-url/execute';
import { linkProfessorToDepartmentFactory } from './use-cases/commands/link-professor-to-department/execute';
import { linkStudentToCourseFactory } from './use-cases/commands/link-student-to-course/execute';
import { unlinkProfessorFromDepartmentFactory } from './use-cases/commands/unlink-professor-from-department/execute';
import { unlinkStudentFromCourseFactory } from './use-cases/commands/unlink-student-from-course/execute';
import { updateProfessorProfileFactory } from './use-cases/commands/update-professor-profile/execute';
import { updateStaffProfileFactory } from './use-cases/commands/update-staff-profile/execute';
import { updateStudentProfileFactory } from './use-cases/commands/update-student-profile/execute';
import { getProfessorProfileByUserIdFactory } from './use-cases/queries/get-professor-profile-by-user-id/execute';
import { getStaffProfileByUserIdFactory } from './use-cases/queries/get-staff-profile-by-user-id/execute';
import { getStudentProfileByUserIdFactory } from './use-cases/queries/get-student-profile-by-user-id/execute';
import { getStudentDashboardByUserIdFactory } from './use-cases/queries/get-student-dashboard-by-user-id/execute';

const createStudentProfile = createStudentProfileFactory({
	commandsRepository,
});
const createProfessorProfile = createProfessorProfileFactory({
	commandsRepository,
});
const createStaffProfile = createStaffProfileFactory({
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

const getStudentProfileByUserId = getStudentProfileByUserIdFactory({
	queriesRepository,
});
const getStudentDashboardByUserId = getStudentDashboardByUserIdFactory({
	queriesRepository,
});
const getProfessorProfileByUserId = getProfessorProfileByUserIdFactory({
	queriesRepository,
});
const getStaffProfileByUserId = getStaffProfileByUserIdFactory({
	queriesRepository,
});

const academicProfileCommandsRouter = createAcademicProfileCommandsRouter({
	createStudentProfile,
	createProfessorProfile,
	createStaffProfile,
	updateStudentProfile,
	updateProfessorProfile,
	updateStaffProfile,
});

const academicRelationCommandsRouter = createAcademicRelationCommandsRouter({
	linkStudentToCourse,
	linkProfessorToDepartment,
	unlinkStudentFromCourse,
	unlinkProfessorFromDepartment,
});

const academicAttachmentCommandsRouter = createAcademicAttachmentCommandsRouter(
	{
		createAcademicActivityAttachmentUploadUrl,
	},
);

export const academicCommandsRouter = new Elysia()
	.use(academicProfileCommandsRouter)
	.use(academicRelationCommandsRouter)
	.use(academicAttachmentCommandsRouter);

export const academicQueriesRouter = createAcademicQueriesRouter({
	getStudentProfileByUserId,
	getStudentDashboardByUserId,
	getProfessorProfileByUserId,
	getStaffProfileByUserId,
});
