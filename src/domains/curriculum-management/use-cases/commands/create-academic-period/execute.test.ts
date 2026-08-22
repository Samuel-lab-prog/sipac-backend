import { describe, expect, it } from 'bun:test';
import { ConflictError, UnknownError } from '@DomainError';
import { createAcademicPeriodFactory } from './execute';

describe('curriculum-management > createAcademicPeriod', () => {
	it('creates an academic period', async () => {
		const sut = createAcademicPeriodFactory({
			commandsRepository: {
				createAcademicPeriod: async () => ({
					ok: true,
					data: {
						id: 1,
						code: '2026-1',
						year: 2026,
						term: 1,
						startsAt: new Date('2026-01-01T00:00:00.000Z'),
						endsAt: new Date('2026-06-30T00:00:00.000Z'),
					},
				}),
			},
		});

		await expect(
			sut({
				code: '2026-1',
				year: 2026,
				term: 1,
				startsAt: new Date('2026-01-01T00:00:00.000Z'),
				endsAt: new Date('2026-06-30T00:00:00.000Z'),
			}),
		).resolves.toMatchObject({ code: '2026-1' });
	});

	it('throws ConflictError when the period already exists', async () => {
		const sut = createAcademicPeriodFactory({
			commandsRepository: {
				createAcademicPeriod: async () => ({
					ok: false,
					data: null,
					code: 'CONFLICT',
					message: 'Academic period already exists',
				}),
			},
		});

		await expect(
			sut({
				code: '2026-1',
				year: 2026,
				term: 1,
				startsAt: new Date('2026-01-01T00:00:00.000Z'),
				endsAt: new Date('2026-06-30T00:00:00.000Z'),
			}),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('throws UnknownError when the repository returns an unexpected failure', async () => {
		const sut = createAcademicPeriodFactory({
			commandsRepository: {
				createAcademicPeriod: async () => ({
					ok: false,
					data: null,
					code: 'UNKNOWN',
					message: 'Unexpected failure',
				}),
			},
		});

		await expect(
			sut({
				code: '2026-1',
				year: 2026,
				term: 1,
				startsAt: new Date('2026-01-01T00:00:00.000Z'),
				endsAt: new Date('2026-06-30T00:00:00.000Z'),
			}),
		).rejects.toBeInstanceOf(UnknownError);
	});
});
