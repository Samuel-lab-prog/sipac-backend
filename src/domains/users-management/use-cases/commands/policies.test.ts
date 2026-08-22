import { describe, expect, it } from 'bun:test';
import { ForbiddenError } from '@DomainError';
import { assertCanUpdateSelf, assertCanUpdateUser } from './policies';

describe('POLICY - Users Management Commands', () => {
	describe('policies', () => {
		it('allows active admin and staff users to update another user', () => {
			expect(() => assertCanUpdateUser('admin', 'active')).not.toThrow();
			expect(() => assertCanUpdateUser('staff', 'active')).not.toThrow();
		});

		it('blocks non-admin roles from updating another user', () => {
			expect(() => assertCanUpdateUser('student', 'active')).toThrow(
				ForbiddenError,
			);
			expect(() => assertCanUpdateUser('professor', 'active')).toThrow(
				ForbiddenError,
			);
		});

		it('blocks inactive users from updating another user', () => {
			expect(() => assertCanUpdateUser('admin', 'blocked')).toThrow(
				ForbiddenError,
			);
			expect(() => assertCanUpdateUser('staff', 'suspended')).toThrow(
				ForbiddenError,
			);
		});

		it('allows active users to update their own data', () => {
			expect(() => assertCanUpdateSelf('active')).not.toThrow();
		});

		it('blocks inactive users from updating their own data', () => {
			expect(() => assertCanUpdateSelf('blocked')).toThrow(ForbiddenError);
			expect(() => assertCanUpdateSelf('suspended')).toThrow(ForbiddenError);
		});
	});
});
