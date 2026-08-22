import { describe, expect, it } from 'bun:test';
import { ForbiddenError } from '@DomainError';
import {
	assertCanCreateProfessorProfile,
	assertCanCreateStaffProfile,
	assertCanCreateStudentProfile,
} from './policies';

const selfStudentCtx = {
	actorId: 1,
	targetUserId: 1,
	actorRole: 'student' as const,
	actorStatus: 'active' as const,
};

const adminCtx = {
	actorId: 1,
	targetUserId: 2,
	actorRole: 'admin' as const,
	actorStatus: 'active' as const,
};

describe('POLICY - Academic Management Commands', () => {
	describe('policies', () => {
		it('allows active students to create their own profile', () => {
			expect(() => assertCanCreateStudentProfile(selfStudentCtx)).not.toThrow();
		});

		it('blocks inactive users from creating their own profile', () => {
			expect(() =>
				assertCanCreateStudentProfile({
					...selfStudentCtx,
					actorStatus: 'blocked',
				}),
			).toThrow(ForbiddenError);
			expect(() =>
				assertCanCreateStudentProfile({
					...selfStudentCtx,
					actorStatus: 'suspended',
				}),
			).toThrow(ForbiddenError);
		});

		it('allows active privileged users to create professor profiles', () => {
			expect(() => assertCanCreateProfessorProfile(adminCtx)).not.toThrow();
			expect(() =>
				assertCanCreateProfessorProfile({
					...adminCtx,
					actorRole: 'staff',
				}),
			).not.toThrow();
		});

		it('blocks non-privileged users from creating professor profiles', () => {
			expect(() =>
				assertCanCreateProfessorProfile({
					...adminCtx,
					actorRole: 'student',
				}),
			).toThrow(ForbiddenError);
		});

		it('allows only active admins to create staff profiles', () => {
			expect(() => assertCanCreateStaffProfile(adminCtx)).not.toThrow();
			expect(() =>
				assertCanCreateStaffProfile({
					...adminCtx,
					actorRole: 'staff',
				}),
			).toThrow(ForbiddenError);
		});
	});
});
