import { describe, expect, it } from 'bun:test';
import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import { makeAcademicCommandsScenario } from '../test-helpers';

describe('academic-management > updateStudentProfile', () => {
	it('updates a student profile', async () => {
		const scenario = makeAcademicCommandsScenario().withStudentProfile();
		scenario.mocks.commandsRepository.updateStudentProfile.mockResolvedValue({
			ok: true,
			data: {
				id: 1,
				userId: 1,
				academicId: '2026009999',
				courseId: 11,
				admissionYear: 2027,
				status: 'active',
			},
		});

		await expect(
			scenario.executeUpdateStudentProfile({ academicId: '2026009999' }),
		).resolves.toMatchObject({ academicId: '2026009999' });
	});

	it('throws NotFoundError when the profile does not exist', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.updateStudentProfile.mockResolvedValue({
			ok: false,
			code: 'NOT_FOUND',
			message: 'Student profile not found',
		});

		await expect(scenario.executeUpdateStudentProfile()).rejects.toBeInstanceOf(
			NotFoundError,
		);
	});

	it('throws ConflictError when the profile already exists', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.updateStudentProfile.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
			message: 'Student profile already exists',
		});

		await expect(scenario.executeUpdateStudentProfile()).rejects.toBeInstanceOf(
			ConflictError,
		);
	});

	it('throws UnknownError when the repository returns an unexpected failure', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.updateStudentProfile.mockResolvedValue({
			ok: false,
			code: 'UNKNOWN',
			message: 'Unexpected failure',
		});

		await expect(scenario.executeUpdateStudentProfile()).rejects.toBeInstanceOf(
			UnknownError,
		);
	});
});
