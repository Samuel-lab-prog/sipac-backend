import { describe, expect, it } from 'bun:test';
import { ConflictError, UnknownError } from '@DomainError';
import { makeAcademicCommandsScenario } from '../test-helpers';

describe('academic-management > createStudentProfile', () => {
	it('creates a student profile', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.insertStudentProfile.mockResolvedValue({
			ok: true,
			data: {
				id: 1,
				userId: 1,
				academicId: '2026000123',
				courseId: 10,
				admissionYear: 2026,
				status: 'active',
			},
		});

		await expect(scenario.executeCreateStudentProfile()).resolves.toMatchObject(
			{
				userId: 1,
				academicId: '2026000123',
			},
		);
	});

	it('throws ConflictError when the profile already exists', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.insertStudentProfile.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
			message: 'Student profile already exists',
		});

		await expect(scenario.executeCreateStudentProfile()).rejects.toBeInstanceOf(
			ConflictError,
		);
	});

	it('throws UnknownError when the repository returns an unexpected failure', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.insertStudentProfile.mockResolvedValue({
			ok: false,
			code: 'UNKNOWN',
			message: 'Unexpected failure',
		});

		await expect(scenario.executeCreateStudentProfile()).rejects.toBeInstanceOf(
			UnknownError,
		);
	});
});
