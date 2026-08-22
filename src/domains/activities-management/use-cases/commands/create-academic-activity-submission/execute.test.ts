import { describe, expect, it } from 'bun:test';
import { ConflictError, UnknownError } from '@DomainError';
import { createAcademicActivitySubmissionFactory } from './execute';

describe('activities-management > createAcademicActivitySubmission', () => {
	it('creates a submission', async () => {
		const sut = createAcademicActivitySubmissionFactory({
			commandsRepository: {
				createAcademicActivitySubmission: async () => ({
					ok: true,
					data: {
						id: 1,
						activityId: 1,
						studentProfileId: 2,
						submittedAt: new Date(),
						grade: null,
						feedback: null,
					},
				}),
			},
		});

		await expect(
			sut({
				actorId: 2,
				actorRole: 'student',
				actorStatus: 'active',
				targetUserId: 2,
				activityId: 1,
				studentProfileId: 2,
			}),
		).resolves.toMatchObject({ id: 1, activityId: 1 });
	});

	it('throws ConflictError on duplicates', async () => {
		const sut = createAcademicActivitySubmissionFactory({
			commandsRepository: {
				createAcademicActivitySubmission: async () => ({
					ok: false,
					data: null,
					code: 'CONFLICT',
					message: 'Academic activity submission already exists',
				}),
			},
		});

		await expect(
			sut({
				actorId: 2,
				actorRole: 'student',
				actorStatus: 'active',
				targetUserId: 2,
				activityId: 1,
				studentProfileId: 2,
			}),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('throws UnknownError on unexpected failures', async () => {
		const sut = createAcademicActivitySubmissionFactory({
			commandsRepository: {
				createAcademicActivitySubmission: async () => ({
					ok: false,
					data: null,
					code: 'UNKNOWN',
					message: 'Unexpected failure',
				}),
			},
		});

		await expect(
			sut({
				actorId: 2,
				actorRole: 'student',
				actorStatus: 'active',
				targetUserId: 2,
				activityId: 1,
				studentProfileId: 2,
			}),
		).rejects.toBeInstanceOf(UnknownError);
	});
});
