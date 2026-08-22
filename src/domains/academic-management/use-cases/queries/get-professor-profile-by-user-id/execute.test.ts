import { describe, expect, it } from 'bun:test';
import { NotFoundError } from '@DomainError';
import { makeAcademicScenario } from '../../test-helpers';

describe('academic-management > getProfessorProfileByUserId', () => {
	it('returns the profile for the given user', async () => {
		const scenario = makeAcademicScenario().withProfessorProfile();

		await expect(scenario.executeGetProfessorProfile()).resolves.toMatchObject({
			userId: 1,
		});
	});

	it('throws NotFoundError when the profile does not exist', async () => {
		const scenario = makeAcademicScenario();

		await expect(scenario.executeGetProfessorProfile()).rejects.toBeInstanceOf(
			NotFoundError,
		);
	});
});
