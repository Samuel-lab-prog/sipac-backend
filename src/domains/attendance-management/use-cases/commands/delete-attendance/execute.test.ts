import { describe, expect, it } from 'bun:test';
import { ForbiddenError, NotFoundError } from '@DomainError';
import { deleteAttendanceFactory } from './execute';

describe('attendance-management > deleteAttendance', () => {
	it('deletes attendance', async () => {
		const sut = deleteAttendanceFactory({
			commandsRepository: {
				markAttendance: async () => ({ ok: true, data: null as any }),
				markAttendanceBatch: async () => ({ ok: true, data: [] as any }),
				selectAttendanceByClassSessionId: async () => [],
				selectAttendanceByStudentProfileId: async () => [],
				deleteAttendance: async () => ({
					ok: true,
					data: {
						id: 1,
						classSessionId: 1,
						studentProfileId: 2,
						status: 'present',
						markedByProfessorProfileId: 3,
					},
				}),
			} as any,
		});

		await expect(
			sut({
				classSessionId: 1,
				studentProfileId: 2,
				actorId: 3,
				actorRole: 'admin',
				actorStatus: 'active',
			}),
		).resolves.toMatchObject({ id: 1 });
	});

	it('blocks unauthorized roles', () => {
		const sut = deleteAttendanceFactory({
			commandsRepository: {
				markAttendance: async () => ({ ok: true, data: null as any }),
				markAttendanceBatch: async () => ({ ok: true, data: [] as any }),
				selectAttendanceByClassSessionId: async () => [],
				selectAttendanceByStudentProfileId: async () => [],
				deleteAttendance: async () => ({
					ok: true,
					data: {
						id: 1,
						classSessionId: 1,
						studentProfileId: 2,
						status: 'present',
						markedByProfessorProfileId: 3,
					},
				}),
			} as any,
		});

		expect(() =>
			sut({
				classSessionId: 1,
				studentProfileId: 2,
				actorId: 3,
				actorRole: 'student',
				actorStatus: 'active',
			}),
		).toThrow(ForbiddenError);
	});

	it('throws NotFoundError when missing', async () => {
		const sut = deleteAttendanceFactory({
			commandsRepository: {
				markAttendance: async () => ({ ok: true, data: null as any }),
				markAttendanceBatch: async () => ({ ok: true, data: [] as any }),
				selectAttendanceByClassSessionId: async () => [],
				selectAttendanceByStudentProfileId: async () => [],
				deleteAttendance: async () => ({
					ok: false,
					data: null,
					code: 'NOT_FOUND',
					message: 'not found',
				}),
			} as any,
		});

		await expect(
			sut({
				classSessionId: 1,
				studentProfileId: 2,
				actorId: 3,
				actorRole: 'admin',
				actorStatus: 'active',
			}),
		).rejects.toBeInstanceOf(NotFoundError);
	});
});
