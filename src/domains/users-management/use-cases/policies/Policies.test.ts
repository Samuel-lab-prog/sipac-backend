import { describe, expect, it } from 'bun:test';
import { ForbiddenError } from '@DomainError';
import { canUpdateData, type CanUpdatePolicyInput } from './Policies';

const VALID_INPUT: CanUpdatePolicyInput = {
	requesterId: 1,
	requesterStatus: 'active',
	targetId: 1,
};

describe.concurrent('POLICY - Users Management - CanUpdateData', () => {
	describe('Successful execution', () => {
		it('should allow users to update their own data', () => {
			expect(() => canUpdateData(VALID_INPUT)).not.toThrow();
		});

		it('should allow suspended users to update their own data', () => {
			expect(() =>
				canUpdateData({
					...VALID_INPUT,
					requesterStatus: 'suspended',
				}),
			).not.toThrow();
		});
	});

	describe('Authorization rules', () => {
		it('should throw ForbiddenError when user is banned', () => {
			expect(() =>
				canUpdateData({
					...VALID_INPUT,
					requesterStatus: 'banned',
				}),
			).toThrow(ForbiddenError);
		});

		it('should throw ForbiddenError when user attempts cross-user update', () => {
			expect(() =>
				canUpdateData({
					...VALID_INPUT,
					targetId: 2,
				}),
			).toThrow(ForbiddenError);
		});
	});
});
