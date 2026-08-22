import { describe, expect, it } from 'bun:test';
import { NotFoundError } from '@DomainError';
import { makeAcademicScenario } from '../../test-helpers';

describe('academic-management > getStaffProfileByUserId', () => {
	it('returns the profile for the given user', async () => {
		const scenario = makeAcademicScenario().withStaffProfile();

		await expect(scenario.executeGetStaffProfile()).resolves.toMatchObject({
			userId: 1,
		});
	});

	it('throws NotFoundError when the profile does not exist', async () => {
		const scenario = makeAcademicScenario();

		await expect(scenario.executeGetStaffProfile()).rejects.toBeInstanceOf(
			NotFoundError,
		);
	});
});
