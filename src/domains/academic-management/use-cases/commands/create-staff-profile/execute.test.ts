import { describe, expect, it } from 'bun:test';
import { ConflictError, UnknownError } from '@DomainError';
import { makeAcademicCommandsScenario } from '../test-helpers';

describe('academic-management > createStaffProfile', () => {
	it('creates a staff profile', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.createStaffProfile.mockResolvedValue({
			ok: true,
			data: {
				id: 1,
				userId: 1,
				departmentId: 20,
			},
		});

		await expect(scenario.executeCreateStaffProfile()).resolves.toMatchObject({
			userId: 1,
			departmentId: 20,
		});
	});

	it('throws ConflictError when the profile already exists', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.createStaffProfile.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
			message: 'Staff profile already exists',
		});

		await expect(scenario.executeCreateStaffProfile()).rejects.toBeInstanceOf(
			ConflictError,
		);
	});

	it('throws UnknownError when the repository returns an unexpected failure', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.createStaffProfile.mockResolvedValue({
			ok: false,
			code: 'UNKNOWN',
			message: 'Unexpected failure',
		});

		await expect(scenario.executeCreateStaffProfile()).rejects.toBeInstanceOf(
			UnknownError,
		);
	});
});
