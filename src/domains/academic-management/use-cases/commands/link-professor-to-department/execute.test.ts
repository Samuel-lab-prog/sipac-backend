import { describe, expect, it } from 'bun:test';
import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import { makeAcademicCommandsScenario } from '../test-helpers';

describe('academic-management > linkProfessorToDepartment', () => {
	it('links a professor to a department', async () => {
		const scenario = makeAcademicCommandsScenario().withProfessorProfile();
		scenario.mocks.commandsRepository.linkProfessorToDepartment.mockResolvedValue(
			{
				ok: true,
				data: {
					id: 1,
					userId: 1,
					registryCode: 'PROF-2026-001',
					departmentId: 21,
					title: 'Dr.',
					workload: 40,
				},
			},
		);

		await expect(
			scenario.executeLinkProfessorToDepartment({ departmentId: 21 }),
		).resolves.toMatchObject({ departmentId: 21 });
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
			scenario.executeLinkProfessorToDepartment(),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('throws ConflictError when the profile already exists', async () => {
		const scenario = makeAcademicCommandsScenario();
		scenario.mocks.commandsRepository.linkProfessorToDepartment.mockResolvedValue(
			{
				ok: false,
				code: 'CONFLICT',
				message: 'Professor profile already exists',
			},
		);

		await expect(
			scenario.executeLinkProfessorToDepartment(),
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
			scenario.executeLinkProfessorToDepartment(),
		).rejects.toBeInstanceOf(UnknownError);
	});
});
