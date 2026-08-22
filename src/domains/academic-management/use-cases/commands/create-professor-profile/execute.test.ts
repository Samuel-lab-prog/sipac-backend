import { describe, expect, it } from 'bun:test';
import { ConflictError, UnknownError } from '@DomainError';
import { makeAcademicCommandsScenario } from '../test-helpers';

describe('academic-management > createProfessorProfile', () => {
	it('creates a professor profile', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.createProfessorProfile.mockResolvedValue({
			ok: true,
			data: {
				id: 1,
				userId: 1,
				registryCode: 'PROF-2026-001',
				departmentId: 20,
				title: 'Dr.',
				workload: 40,
			},
		});

		await expect(
			scenario.executeCreateProfessorProfile(),
		).resolves.toMatchObject({
			userId: 1,
			registryCode: 'PROF-2026-001',
		});
	});

	it('throws ConflictError when the profile already exists', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.createProfessorProfile.mockResolvedValue({
			ok: false,
			code: 'CONFLICT',
			message: 'Professor profile already exists',
		});

		await expect(
			scenario.executeCreateProfessorProfile(),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('throws UnknownError when the repository returns an unexpected failure', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.createProfessorProfile.mockResolvedValue({
			ok: false,
			code: 'UNKNOWN',
			message: 'Unexpected failure',
		});

		await expect(
			scenario.executeCreateProfessorProfile(),
		).rejects.toBeInstanceOf(UnknownError);
	});
});
