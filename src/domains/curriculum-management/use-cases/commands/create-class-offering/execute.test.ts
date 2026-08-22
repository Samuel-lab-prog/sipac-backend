import { describe, expect, it } from 'bun:test';
import { ConflictError, UnknownError } from '@DomainError';
import { createClassOfferingFactory } from './execute';

describe('curriculum-management > createClassOffering', () => {
	it('creates a class offering', async () => {
		const sut = createClassOfferingFactory({
			commandsRepository: {
				createClassOffering: async () => ({
					ok: true,
					data: {
						id: 1,
						academicPeriodId: 1,
						courseId: 1,
						shift: 'morning',
						term: '2026.1',
						year: 2026,
						code: '2026-1-A',
						title: 'Turma 2026.1 A',
					},
				}),
			},
		});

		await expect(
			sut({
				academicPeriodId: 1,
				courseId: 1,
				shift: 'morning',
				term: '2026.1',
				year: 2026,
				code: '2026-1-A',
				title: 'Turma 2026.1 A',
			}),
		).resolves.toMatchObject({ id: 1, shift: 'morning' });
	});

	it('throws ConflictError when the class offering already exists', async () => {
		const sut = createClassOfferingFactory({
			commandsRepository: {
				createClassOffering: async () => ({
					ok: false,
					data: null,
					code: 'CONFLICT',
					message: 'Class offering already exists',
				}),
			},
		});

		await expect(
			sut({
				academicPeriodId: 1,
				courseId: 1,
				shift: 'morning',
				term: '2026.1',
				year: 2026,
				code: '2026-1-A',
				title: 'Turma 2026.1 A',
			}),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('throws UnknownError when the repository returns an unexpected failure', async () => {
		const sut = createClassOfferingFactory({
			commandsRepository: {
				createClassOffering: async () => ({
					ok: false,
					data: null,
					code: 'UNKNOWN',
					message: 'Unexpected failure',
				}),
			},
		});

		await expect(
			sut({
				academicPeriodId: 1,
				courseId: 1,
				shift: 'morning',
				term: '2026.1',
				year: 2026,
				code: '2026-1-A',
				title: 'Turma 2026.1 A',
			}),
		).rejects.toBeInstanceOf(UnknownError);
	});
});
