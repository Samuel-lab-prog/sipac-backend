import { describe, expect, it } from 'bun:test';
import { ConflictError, NotFoundError, UnknownError } from '@DomainError';
import { markAttendanceFactory } from './execute';

describe('attendance-management > markAttendance', () => {
	it('marks attendance', async () => {
		const sut = markAttendanceFactory({
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
				studentProfileId: 2,
				status: 'present',
				actorId: 3,
				actorRole: 'staff',
				actorStatus: 'active',
				targetUserId: 3,
			}),
		).resolves.toMatchObject({ id: 1 });
	});

	it('throws ConflictError on duplicate', async () => {
		const sut = markAttendanceFactory({
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
				studentProfileId: 2,
				status: 'present',
				actorId: 3,
				actorRole: 'staff',
				actorStatus: 'active',
				targetUserId: 3,
			}),
		).rejects.toBeInstanceOf(ConflictError);
	});

	it('throws NotFoundError when target missing', async () => {
		const sut = markAttendanceFactory({
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
				studentProfileId: 2,
				status: 'present',
				actorId: 3,
				actorRole: 'staff',
				actorStatus: 'active',
				targetUserId: 3,
			}),
		).rejects.toBeInstanceOf(NotFoundError);
	});

	it('throws UnknownError on unexpected failure', async () => {
		const sut = markAttendanceFactory({
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
				studentProfileId: 2,
				status: 'present',
				actorId: 3,
				actorRole: 'staff',
				actorStatus: 'active',
				targetUserId: 3,
			}),
		).rejects.toBeInstanceOf(UnknownError);
	});
});
