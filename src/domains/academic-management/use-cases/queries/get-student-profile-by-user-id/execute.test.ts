import { describe, expect, it } from 'bun:test';
import { NotFoundError } from '@DomainError';
import { makeAcademicScenario } from '../../test-helpers';

describe('academic-management > getStudentProfileByUserId', () => {
	it('returns the profile for the given user', async () => {
		const scenario = makeAcademicScenario().withStudentProfile();

		await expect(scenario.executeGetStudentProfile()).resolves.toMatchObject({
			userId: 1,
		});
	});

	it('throws NotFoundError when the profile does not exist', async () => {
		const scenario = makeAcademicScenario();

		await expect(scenario.executeGetStudentProfile()).rejects.toBeInstanceOf(
			NotFoundError,
		);
	});
});
