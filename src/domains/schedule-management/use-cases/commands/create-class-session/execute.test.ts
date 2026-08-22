import { describe, expect, it } from 'bun:test';
import { ConflictError, UnknownError } from '@DomainError';
import { createClassSessionFactory } from './execute';

describe('schedule-management > createClassSession', () => {
	it('creates a class session', async () => {
		const sut = createClassSessionFactory({
			commandsRepository: {
				selectClassSessionsByClassOfferingId: async () => [],
				createClassSession: async () => ({
					ok: true,
					data: {
						id: 1,
						classOfferingId: 1,
						startsAt: new Date('2026-08-22T10:00:00.000Z'),
						endsAt: null,
						topic: 'Introducao',
					},
				}),
			},
		});

		await expect(
			sut({
				classOfferingId: 1,
				startsAt: new Date('2026-08-22T10:00:00.000Z'),
				endsAt: null,
				topic: 'Introducao',
			}),
		).resolves.toMatchObject({ id: 1 });
	});

	it('throws ConflictError when the slot already exists', async () => {
		const sut = createClassSessionFactory({
			commandsRepository: {
				selectClassSessionsByClassOfferingId: async () => [
					{
						id: 1,
						classOfferingId: 1,
						startsAt: new Date('2026-08-22T10:00:00.000Z'),
						endsAt: null,
						topic: null,
					},
				],
				createClassSession: async () => ({
					ok: true,
					data: {
						id: 1,
						classOfferingId: 1,
						startsAt: new Date('2026-08-22T10:00:00.000Z'),
						endsAt: null,
						topic: 'Introducao',
					},
				}),
			},
		});

		await expect(
			sut({
				classOfferingId: 1,
				startsAt: new Date('2026-08-22T10:00:00.000Z'),
				endsAt: null,
				topic: 'Introducao',
			}),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('throws UnknownError on repository failure', async () => {
		const sut = createClassSessionFactory({
			commandsRepository: {
				selectClassSessionsByClassOfferingId: async () => [],
				createClassSession: async () => ({
					ok: false,
					data: null,
					code: 'UNKNOWN',
					message: 'boom',
				}),
			},
		});

		await expect(
			sut({
				classOfferingId: 1,
				startsAt: new Date('2026-08-22T10:00:00.000Z'),
				endsAt: null,
				topic: 'Introducao',
			}),
		).rejects.toBeInstanceOf(UnknownError);
	});
});
