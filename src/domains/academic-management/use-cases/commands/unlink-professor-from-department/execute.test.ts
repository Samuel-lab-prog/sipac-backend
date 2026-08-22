import { describe, expect, it } from 'bun:test';
import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import { makeAcademicCommandsScenario } from '../test-helpers';

describe('academic-management > unlinkProfessorFromDepartment', () => {
	it('unlinks a professor from a department', async () => {
		const scenario = makeAcademicCommandsScenario().withProfessorProfile();
		scenario.mocks.commandsRepository.linkProfessorToDepartment.mockResolvedValue(
			{
				ok: true,
				data: {
					id: 1,
					userId: 1,
					registryCode: 'PROF-2026-001',
					departmentId: null,
					title: 'Dr.',
					workload: 40,
				},
			},
		);

		await expect(
			scenario.executeUnlinkProfessorFromDepartment(),
		).resolves.toMatchObject({ departmentId: null });
	});

	it('throws NotFoundError when the profile does not exist', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.linkProfessorToDepartment.mockResolvedValue(
			{
				ok: false,
				code: 'NOT_FOUND',
				message: 'Professor profile not found',
			},
		);

		await expect(
			scenario.executeUnlinkProfessorFromDepartment(),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('throws ConflictError when the repository reports a conflict', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.linkProfessorToDepartment.mockResolvedValue(
			{
				ok: false,
				code: 'CONFLICT',
				message: 'Professor profile already exists',
			},
		);

		await expect(
			scenario.executeUnlinkProfessorFromDepartment(),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('throws UnknownError when the repository returns an unexpected failure', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.linkProfessorToDepartment.mockResolvedValue(
			{
				ok: false,
				code: 'UNKNOWN',
				message: 'Unexpected failure',
			},
		);

		await expect(
			scenario.executeUnlinkProfessorFromDepartment(),
		).rejects.toBeInstanceOf(UnknownError);
	});
});
