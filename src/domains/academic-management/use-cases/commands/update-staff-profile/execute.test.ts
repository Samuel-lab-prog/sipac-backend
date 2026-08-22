import { describe, expect, it } from 'bun:test';
import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import { makeAcademicCommandsScenario } from '../test-helpers';

describe('academic-management > updateStaffProfile', () => {
	it('updates a staff profile', async () => {
		const scenario = makeAcademicCommandsScenario().withStaffProfile();
		scenario.mocks.commandsRepository.updateStaffProfile.mockResolvedValue({
			ok: true,
			data: {
				id: 1,
				userId: 1,
				departmentId: 21,
			},
		});

		await expect(
			scenario.executeUpdateStaffProfile({ departmentId: 21 }),
		).resolves.toMatchObject({
			departmentId: 21,
		});
	});

	it('throws NotFoundError when the profile does not exist', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.updateStaffProfile.mockResolvedValue({
			ok: false,
			code: 'NOT_FOUND',
			message: 'Staff profile not found',
		});

		await expect(scenario.executeUpdateStaffProfile()).rejects.toBeInstanceOf(
			NotFoundError,
		);
	});

	it('throws ConflictError when the profile already exists', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.updateStaffProfile.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
			message: 'Staff profile already exists',
		});

		await expect(scenario.executeUpdateStaffProfile()).rejects.toBeInstanceOf(
			ConflictError,
		);
	});

	it('throws UnknownError when the repository returns an unexpected failure', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.updateStaffProfile.mockResolvedValue({
			ok: false,
			code: 'UNKNOWN',
			message: 'Unexpected failure',
		});

		await expect(scenario.executeUpdateStaffProfile()).rejects.toBeInstanceOf(
			UnknownError,
		);
	});
});
