import { describe, expect, it } from 'bun:test';
import { ConflictError, UnknownError } from '@DomainError';
import { createAcademicActivityFactory } from './execute';

describe('activities-management > createAcademicActivity', () => {
	it('creates an academic activity', async () => {
		const sut = createAcademicActivityFactory({
			commandsRepository: {
				createAcademicActivity: async () => ({
					ok: true,
					data: {
						id: 1,
						classOfferingId: 1,
						title: 'Lista 1',
						description: null,
						dueAt: null,
						createdByProfessorProfileId: 1,
					},
				}),
			},
		});

		await expect(
			sut({
				actorId: 1,
				actorRole: 'admin',
				actorStatus: 'active',
				targetUserId: 1,
				classOfferingId: 1,
				title: 'Lista 1',
				description: null,
				dueAt: null,
				createdByProfessorProfileId: 1,
			}),
		).resolves.toMatchObject({ id: 1, title: 'Lista 1' });
	});

	it('throws ConflictError on duplicates', async () => {
		const sut = createAcademicActivityFactory({
			commandsRepository: {
				createAcademicActivity: async () => ({
					ok: false,
					data: null,
					code: 'CONFLICT',
					message: 'Academic activity already exists',
				}),
			},
		});

		await expect(
			sut({
				actorId: 1,
				actorRole: 'admin',
				actorStatus: 'active',
				targetUserId: 1,
				classOfferingId: 1,
				title: 'Lista 1',
				description: null,
				dueAt: null,
				createdByProfessorProfileId: 1,
			}),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('throws UnknownError on unexpected failures', async () => {
		const sut = createAcademicActivityFactory({
			commandsRepository: {
				createAcademicActivity: async () => ({
					ok: false,
					data: null,
					code: 'UNKNOWN',
					message: 'Unexpected failure',
				}),
			},
		});

		await expect(
			sut({
				actorId: 1,
				actorRole: 'admin',
				actorStatus: 'active',
				targetUserId: 1,
				classOfferingId: 1,
				title: 'Lista 1',
				description: null,
				dueAt: null,
				createdByProfessorProfileId: 1,
			}),
		).rejects.toBeInstanceOf(UnknownError);
	});
});
