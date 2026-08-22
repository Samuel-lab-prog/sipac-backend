/* eslint-disable max-lines-per-function */
import { mock } from 'bun:test';
import { makeSut } from '@GenericSubdomains/utils/testing/utils';
import type { AcademicCommandsRepository } from '../../../ports/commands';
import type { StorageService } from '@SharedKernel/ports/storage';
import { createStudentProfileFactory } from '../create-student-profile/execute';
import { createProfessorProfileFactory } from '../create-professor-profile/execute';
import { createStaffProfileFactory } from '../create-staff-profile/execute';
import { createAcademicActivityAttachmentUploadUrlFactory } from '../create-academic-activity-attachment-upload-url/execute';
import { updateStudentProfileFactory } from '../update-student-profile/execute';
import { updateProfessorProfileFactory } from '../update-professor-profile/execute';
import { updateStaffProfileFactory } from '../update-staff-profile/execute';
import { linkStudentToCourseFactory } from '../link-student-to-course/execute';
import { linkProfessorToDepartmentFactory } from '../link-professor-to-department/execute';
import { unlinkStudentFromCourseFactory } from '../unlink-student-from-course/execute';
import { unlinkProfessorFromDepartmentFactory } from '../unlink-professor-from-department/execute';
import {
	givenProfessorProfile,
	givenStaffProfile,
	givenStudentProfile,
} from './givens';
import {
	DEFAULT_ACTOR_ID,
	DEFAULT_PRIVILEGED_TARGET_USER_ID,
	DEFAULT_TARGET_USER_ID,
} from './constants';

function commandsMocks() {
	return {
		insertStudentProfile: mock(),
		createProfessorProfile: mock(),
		createStaffProfile: mock(),
		updateStudentProfile: mock(),
		updateProfessorProfile: mock(),
		updateStaffProfile: mock(),
		linkStudentToCourse: mock(),
		linkProfessorToDepartment: mock(),
		unlinkStudentFromCourse: mock(),
		unlinkProfessorFromDepartment: mock(),
	} satisfies AcademicCommandsRepository;
}

export function makeAcademicCommandsScenario() {
	const validateFileContentType = mock(() => true);
	const generateFileUploadUrl = mock();
	const generateAvatarUploadUrl = mock();
	const validateImageContentType = mock();
	const generatePoemAudioUploadUrl = mock();
	const validateAudioContentType = mock();
	const storageService: StorageService = {
		validateFileContentType,
		generateFileUploadUrl,
		generateAvatarUploadUrl,
		validateImageContentType,
		generatePoemAudioUploadUrl,
		validateAudioContentType,
	};
	const { sut, mocks } = makeSut(
		(m) => ({
			createStudentProfile: createStudentProfileFactory({
				commandsRepository: m.commandsRepository,
			}),
			createProfessorProfile: createProfessorProfileFactory({
				commandsRepository: m.commandsRepository,
			}),
			createStaffProfile: createStaffProfileFactory({
				commandsRepository: m.commandsRepository,
			}),
			createAcademicActivityAttachmentUploadUrl:
				createAcademicActivityAttachmentUploadUrlFactory({
					storageService,
				}),
			updateStudentProfile: updateStudentProfileFactory({
				commandsRepository: m.commandsRepository,
			}),
			updateProfessorProfile: updateProfessorProfileFactory({
				commandsRepository: m.commandsRepository,
			}),
			updateStaffProfile: updateStaffProfileFactory({
				commandsRepository: m.commandsRepository,
			}),
			linkStudentToCourse: linkStudentToCourseFactory({
				commandsRepository: m.commandsRepository,
			}),
			linkProfessorToDepartment: linkProfessorToDepartmentFactory({
				commandsRepository: m.commandsRepository,
			}),
			unlinkStudentFromCourse: unlinkStudentFromCourseFactory({
				commandsRepository: m.commandsRepository,
			}),
			unlinkProfessorFromDepartment: unlinkProfessorFromDepartmentFactory({
				commandsRepository: m.commandsRepository,
			}),
		}),
		{ commandsRepository: commandsMocks() },
	);

	return {
		withStudentProfile(overrides = {}) {
			givenStudentProfile(mocks.commandsRepository, overrides);
			return this;
		},
		withProfessorProfile(overrides = {}) {
			givenProfessorProfile(mocks.commandsRepository, overrides);
			return this;
		},
		withStaffProfile(overrides = {}) {
			givenStaffProfile(mocks.commandsRepository, overrides);
			return this;
		},
		withAttachmentUploadUrl() {
			validateFileContentType.mockReturnValue(true);
			generateFileUploadUrl.mockResolvedValue({
				uploadUrl: 'https://example.com/upload',
				fields: { key: 'file' },
				fileUrl: 'https://example.com/file.pdf',
			});
			return this;
		},
		executeCreateStudentProfile(params = {}) {
			return sut.createStudentProfile({
				actorId: DEFAULT_ACTOR_ID,
				actorRole: 'student',
				actorStatus: 'active',
				userId: DEFAULT_TARGET_USER_ID,
				targetUserId: DEFAULT_TARGET_USER_ID,
				academicId: '2026000123',
				courseId: 10,
				admissionYear: 2026,
				status: 'active',
				...params,
			});
		},
		executeCreateProfessorProfile(params = {}) {
			return sut.createProfessorProfile({
				actorId: DEFAULT_ACTOR_ID,
				actorRole: 'admin',
				actorStatus: 'active',
				userId: DEFAULT_PRIVILEGED_TARGET_USER_ID,
				registryCode: 'PROF-2026-001',
				departmentId: 20,
				title: 'Dr.',
				workload: 40,
				...params,
			});
		},
		executeCreateStaffProfile(params = {}) {
			return sut.createStaffProfile({
				actorId: DEFAULT_ACTOR_ID,
				actorRole: 'admin',
				actorStatus: 'active',
				userId: DEFAULT_PRIVILEGED_TARGET_USER_ID,
				departmentId: 20,
				...params,
			});
		},
		executeUpdateStudentProfile(params = {}) {
			return sut.updateStudentProfile({
				actorId: DEFAULT_ACTOR_ID,
				actorRole: 'student',
				actorStatus: 'active',
				targetUserId: DEFAULT_TARGET_USER_ID,
				academicId: '2026000123',
				courseId: 10,
				admissionYear: 2026,
				status: 'active',
				...params,
			});
		},
		executeUpdateProfessorProfile(params = {}) {
			return sut.updateProfessorProfile({
				actorId: DEFAULT_ACTOR_ID,
				actorRole: 'admin',
				actorStatus: 'active',
				targetUserId: DEFAULT_PRIVILEGED_TARGET_USER_ID,
				registryCode: 'PROF-2026-001',
				departmentId: 20,
				title: 'Dr.',
				workload: 40,
				...params,
			});
		},
		executeUpdateStaffProfile(params = {}) {
			return sut.updateStaffProfile({
				actorId: DEFAULT_ACTOR_ID,
				actorRole: 'admin',
				actorStatus: 'active',
				targetUserId: DEFAULT_PRIVILEGED_TARGET_USER_ID,
				departmentId: 20,
				...params,
			});
		},
		executeLinkStudentToCourse(params = {}) {
			return sut.linkStudentToCourse({
				actorId: DEFAULT_ACTOR_ID,
				actorRole: 'student',
				actorStatus: 'active',
				targetUserId: DEFAULT_TARGET_USER_ID,
				courseId: 10,
				...params,
			});
		},
		executeLinkProfessorToDepartment(params = {}) {
			return sut.linkProfessorToDepartment({
				actorId: DEFAULT_ACTOR_ID,
				actorRole: 'admin',
				actorStatus: 'active',
				targetUserId: DEFAULT_PRIVILEGED_TARGET_USER_ID,
				departmentId: 20,
				...params,
			});
		},
		executeUnlinkStudentFromCourse(params = {}) {
			return sut.unlinkStudentFromCourse({
				actorId: DEFAULT_ACTOR_ID,
				actorRole: 'student',
				actorStatus: 'active',
				targetUserId: DEFAULT_TARGET_USER_ID,
				...params,
			});
		},
		executeUnlinkProfessorFromDepartment(params = {}) {
			return sut.unlinkProfessorFromDepartment({
				actorId: DEFAULT_ACTOR_ID,
				actorRole: 'admin',
				actorStatus: 'active',
				targetUserId: DEFAULT_PRIVILEGED_TARGET_USER_ID,
				...params,
			});
		},
		executeCreateAcademicActivityAttachmentUploadUrl(params = {}) {
			return sut.createAcademicActivityAttachmentUploadUrl({
				actorId: DEFAULT_ACTOR_ID,
				actorRole: 'admin',
				actorStatus: 'active',
				targetUserId: DEFAULT_PRIVILEGED_TARGET_USER_ID,
				activityId: 1,
				data: {
					contentType: 'application/pdf',
					contentLength: 10,
					fileName: 'file.pdf',
				},
				...params,
			});
		},
		get mocks() {
			return mocks;
		},
	};
}
