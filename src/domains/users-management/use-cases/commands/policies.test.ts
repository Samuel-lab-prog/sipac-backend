import { describe, expect, it } from 'bun:test';
import { ForbiddenError } from '@DomainError';
import {
	assertCanAccessUser,
	assertCanDeleteUser,
	assertCanRestoreUser,
	assertCanUpdateSelf,
	assertCanUpdateUser,
} from './policies';

const adminCtx = {
	actorId: 1,
	targetId: 2,
	actorRole: 'admin' as const,
	actorStatus: 'active' as const,
};

const selfCtx = {
	actorId: 1,
	targetId: 1,
	actorRole: 'student' as const,
	actorStatus: 'active' as const,
};

describe('POLICY - Users Management Commands', () => {
	describe('policies', () => {
		it('allows active admin and staff users to update another user', () => {
			expect(() => assertCanUpdateUser(adminCtx)).not.toThrow();
			expect(() =>
				assertCanUpdateUser({ ...adminCtx, actorRole: 'staff' }),
			).not.toThrow();
		});

		it('blocks non-admin roles from updating another user', () => {
			expect(() =>
				assertCanUpdateUser({ ...adminCtx, actorRole: 'student' }),
			).toThrow(ForbiddenError);
			expect(() =>
				assertCanUpdateUser({ ...adminCtx, actorRole: 'professor' }),
			).toThrow(ForbiddenError);
		});

		it('blocks inactive users from updating another user', () => {
			expect(() =>
				assertCanUpdateUser({ ...adminCtx, actorStatus: 'blocked' }),
			).toThrow(ForbiddenError);
			expect(() =>
				assertCanUpdateUser({ ...adminCtx, actorStatus: 'suspended' }),
			).toThrow(ForbiddenError);
		});

		it('allows active users to update their own data', () => {
			expect(() => assertCanUpdateSelf(selfCtx)).not.toThrow();
		});

		it('blocks inactive users from updating their own data', () => {
			expect(() =>
				assertCanUpdateSelf({ ...selfCtx, actorStatus: 'blocked' }),
			).toThrow(ForbiddenError);
			expect(() =>
				assertCanUpdateSelf({ ...selfCtx, actorStatus: 'suspended' }),
			).toThrow(ForbiddenError);
		});

		it('allows privileged users to access, delete and restore another user', () => {
			expect(() => assertCanAccessUser(adminCtx)).not.toThrow();
			expect(() => assertCanDeleteUser(adminCtx)).not.toThrow();
			expect(() => assertCanRestoreUser(adminCtx)).not.toThrow();
		});
	});
});
