import { describe, expect, it } from 'bun:test';
import { ForbiddenError, NotFoundError } from '@DomainError';
import { deleteClassSessionFactory } from './execute';

describe('schedule-management > deleteClassSession', () => {
	it('deletes a class session', async () => {
		const sut = deleteClassSessionFactory({
			commandsRepository: {
				createClassSession: async () => ({ ok: true, data: null as any }),
				updateClassSession: async () => ({ ok: true, data: null as any }),
				selectClassSessionsByClassOfferingId: async () => [],
				selectClassSessionById: async () => ({
					id: 1,
					classOfferingId: 1,
					startsAt: new Date('2026-08-22T10:00:00.000Z'),
					endsAt: null,
					topic: null,
				}),
				deleteClassSession: async () => ({
					ok: true,
					data: {
						id: 1,
						classOfferingId: 1,
						startsAt: new Date('2026-08-22T10:00:00.000Z'),
						endsAt: null,
						topic: null,
					},
				}),
			} as any,
		});

		await expect(
			sut({
				classSessionId: 1,
				actorId: 1,
				actorRole: 'admin',
				actorStatus: 'active',
			}),
		).resolves.toMatchObject({ id: 1 });
	});

	it('blocks unauthorized roles', () => {
		const sut = deleteClassSessionFactory({
			commandsRepository: {
				createClassSession: async () => ({ ok: true, data: null as any }),
				updateClassSession: async () => ({ ok: true, data: null as any }),
				selectClassSessionsByClassOfferingId: async () => [],
				selectClassSessionById: async () => null,
				deleteClassSession: async () => ({
					ok: true,
					data: {
						id: 1,
						classOfferingId: 1,
						startsAt: new Date('2026-08-22T10:00:00.000Z'),
						endsAt: null,
						topic: null,
					},
				}),
			} as any,
		});

		expect(() =>
			sut({
				classSessionId: 1,
				actorId: 1,
				actorRole: 'student',
				actorStatus: 'active',
			}),
		).toThrow(ForbiddenError);
	});

	it('throws NotFoundError when the session does not exist', async () => {
		const sut = deleteClassSessionFactory({
			commandsRepository: {
				createClassSession: async () => ({ ok: true, data: null as any }),
				updateClassSession: async () => ({ ok: true, data: null as any }),
				selectClassSessionsByClassOfferingId: async () => [],
				selectClassSessionById: async () => null,
				deleteClassSession: async () => ({
					ok: true,
					data: {
						id: 1,
						classOfferingId: 1,
						startsAt: new Date('2026-08-22T10:00:00.000Z'),
						endsAt: null,
						topic: null,
					},
				}),
			} as any,
		});

		await expect(
			sut({
				classSessionId: 1,
				actorId: 1,
				actorRole: 'admin',
				actorStatus: 'active',
			}),
		).rejects.toBeInstanceOf(NotFoundError);
	});
});
