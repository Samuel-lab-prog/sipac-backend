import { describe, expect, it } from 'bun:test';
import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import { makeAcademicCommandsScenario } from '../test-helpers';

describe('academic-management > unlinkStudentFromCourse', () => {
	it('unlinks a student from a course', async () => {
		const scenario = makeAcademicCommandsScenario().withStudentProfile();
		scenario.mocks.commandsRepository.linkStudentToCourse.mockResolvedValue({
			ok: true,
			data: {
				id: 1,
				userId: 1,
				academicId: '2026000123',
				courseId: null,
				admissionYear: 2026,
				status: 'active',
			},
		});

		await expect(
			scenario.executeUnlinkStudentFromCourse(),
		).resolves.toMatchObject({
			courseId: null,
		});
	});

	it('throws NotFoundError when the profile does not exist', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.linkStudentToCourse.mockResolvedValue({
			ok: false,
			code: 'NOT_FOUND',
			message: 'Student profile not found',
		});

		await expect(
			scenario.executeUnlinkStudentFromCourse(),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('throws ConflictError when the repository reports a conflict', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.linkStudentToCourse.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
			message: 'Student profile already exists',
		});

		await expect(
			scenario.executeUnlinkStudentFromCourse(),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('throws UnknownError when the repository returns an unexpected failure', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.linkStudentToCourse.mockResolvedValue({
			ok: false,
			code: 'UNKNOWN',
			message: 'Unexpected failure',
		});

		await expect(
			scenario.executeUnlinkStudentFromCourse(),
		).rejects.toBeInstanceOf(UnknownError);
	});
});
