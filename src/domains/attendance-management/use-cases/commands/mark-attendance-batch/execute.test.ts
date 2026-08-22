import { describe, expect, it } from 'bun:test';
import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import { markAttendanceBatchFactory } from './execute';

describe('attendance-management > markAttendanceBatch', () => {
	it('marks a batch', async () => {
		const sut = markAttendanceBatchFactory({
			commandsRepository: {
				markAttendance: async () => ({
					ok: true,
					data: {
						id: 1,
						classSessionId: 1,
						studentProfileId: 2,
						status: 'present',
						markedByProfessorProfileId: 3,
					},
				}),
			},
		});

		await expect(
			sut({
				classSessionId: 1,
				actorId: 3,
				actorRole: 'staff',
				actorStatus: 'active',
				targetUserId: 3,
				attendances: [
					{ studentProfileId: 2, status: 'present' },
					{ studentProfileId: 4, status: 'absent' },
				],
			}),
		).resolves.toHaveLength(2);
	});

	it('throws on duplicate', async () => {
		const sut = markAttendanceBatchFactory({
			commandsRepository: {
				markAttendance: async () => ({
					ok: false,
					data: null,
					code: 'CONFLICT',
					message: 'duplicate',
				}),
			},
		});

		await expect(
			sut({
				classSessionId: 1,
				actorId: 3,
				actorRole: 'staff',
				actorStatus: 'active',
				targetUserId: 3,
				attendances: [{ studentProfileId: 2, status: 'present' }],
			}),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('throws on missing record', async () => {
		const sut = markAttendanceBatchFactory({
			commandsRepository: {
				markAttendance: async () => ({
					ok: false,
					data: null,
					code: 'NOT_FOUND',
					message: 'missing',
				}),
			},
		});

		await expect(
			sut({
				classSessionId: 1,
				actorId: 3,
				actorRole: 'staff',
				actorStatus: 'active',
				targetUserId: 3,
				attendances: [{ studentProfileId: 2, status: 'present' }],
			}),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('throws on unexpected failure', async () => {
		const sut = markAttendanceBatchFactory({
			commandsRepository: {
				markAttendance: async () => ({
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
				actorId: 3,
				actorRole: 'staff',
				actorStatus: 'active',
				targetUserId: 3,
				attendances: [{ studentProfileId: 2, status: 'present' }],
			}),
		).rejects.toBeInstanceOf(UnknownError);
	});
});
