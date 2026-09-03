import { describe, expect, it } from 'bun:test';
import { createAcademicActivitySubmissionUploadUrlFactory } from './execute';

describe('activities-management > createAcademicActivitySubmissionUploadUrl', () => {
	it('creates an upload url for an active student', async () => {
		const sut = createAcademicActivitySubmissionUploadUrlFactory({
			storageService: {
				validateFileContentType: () => true,
				generateFileUploadUrl: async () => ({
					uploadUrl: 'https://upload.test',
					fields: {},
					fileUrl: 'https://files.test/a.pdf',
				}),
			} as never,
		});

		await expect(
			sut({
				activityId: 1,
				data: { fileName: 'atividade.pdf', contentType: 'application/pdf' },
				actorId: 10,
				actorRole: 'student',
				actorStatus: 'active',
				targetUserId: 10,
			}),
		).resolves.toMatchObject({ uploadUrl: 'https://upload.test' });
	});
});
