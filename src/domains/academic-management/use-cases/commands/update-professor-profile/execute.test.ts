import { describe, expect, it } from 'bun:test';
import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import { makeAcademicCommandsScenario } from '../test-helpers';

describe('academic-management > updateProfessorProfile', () => {
	it('updates a professor profile', async () => {
		const scenario = makeAcademicCommandsScenario().withProfessorProfile();
		scenario.mocks.commandsRepository.updateProfessorProfile.mockResolvedValue({
			ok: true,
			data: {
				id: 1,
				userId: 1,
				registryCode: 'PROF-2026-999',
				departmentId: 21,
				title: 'Dr.',
				workload: 20,
			},
		});

		await expect(
			scenario.executeUpdateProfessorProfile({ registryCode: 'PROF-2026-999' }),
		).resolves.toMatchObject({ registryCode: 'PROF-2026-999' });
	});

	it('throws NotFoundError when the profile does not exist', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.updateProfessorProfile.mockResolvedValue({
			ok: false,
			code: 'NOT_FOUND',
			message: 'Professor profile not found',
		});

		await expect(
			scenario.executeUpdateProfessorProfile(),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('throws ConflictError when the profile already exists', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.updateProfessorProfile.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
			message: 'Professor profile already exists',
		});

		await expect(
			scenario.executeUpdateProfessorProfile(),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('throws UnknownError when the repository returns an unexpected failure', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.updateProfessorProfile.mockResolvedValue({
			ok: false,
			code: 'UNKNOWN',
			message: 'Unexpected failure',
		});

		await expect(
			scenario.executeUpdateProfessorProfile(),
		).rejects.toBeInstanceOf(UnknownError);
	});
});
