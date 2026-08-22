import { describe, expect, it } from 'bun:test';
import { NotFoundError, UnknownError } from '@DomainError';
import { updateClassSessionFactory } from './execute';

describe('schedule-management > updateClassSession', () => {
	it('updates a class session', async () => {
		const sut = updateClassSessionFactory({
			commandsRepository: {
				selectClassSessionById: async () => ({
					id: 1,
					classOfferingId: 1,
					startsAt: new Date('2026-08-22T10:00:00.000Z'),
					endsAt: null,
					topic: null,
				}),
				updateClassSession: async () => ({
					ok: true,
					data: {
						id: 1,
						classOfferingId: 1,
						startsAt: new Date('2026-08-22T11:00:00.000Z'),
						endsAt: null,
						topic: 'Aula atualizada',
					},
				}),
			},
		});

		await expect(
			sut({
				classSessionId: 1,
				startsAt: new Date('2026-08-22T11:00:00.000Z'),
				topic: 'Aula atualizada',
			}),
		).resolves.toMatchObject({ topic: 'Aula atualizada' });
	});

	it('throws NotFoundError when the session is missing', async () => {
		const sut = updateClassSessionFactory({
			commandsRepository: {
				selectClassSessionById: async () => null,
				updateClassSession: async () => ({
					ok: true,
					data: {
						id: 1,
						classOfferingId: 1,
						startsAt: new Date('2026-08-22T11:00:00.000Z'),
						endsAt: null,
						topic: 'Aula atualizada',
					},
				}),
			},
		});

		await expect(
			sut({
				classSessionId: 1,
				startsAt: new Date('2026-08-22T11:00:00.000Z'),
				topic: 'Aula atualizada',
			}),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('throws UnknownError on repository failure', async () => {
		const sut = updateClassSessionFactory({
			commandsRepository: {
				selectClassSessionById: async () => ({
					id: 1,
					classOfferingId: 1,
					startsAt: new Date('2026-08-22T10:00:00.000Z'),
					endsAt: null,
					topic: null,
				}),
				updateClassSession: async () => ({
					ok: false,
					data: null,
					code: 'UNKNOWN',
					message: 'boom',
				}),
			},
		});

		await expect(
			sut({
				classSessionId: 1,
				startsAt: new Date('2026-08-22T11:00:00.000Z'),
				topic: 'Aula atualizada',
			}),
		).rejects.toBeInstanceOf(UnknownError);
	});
});
