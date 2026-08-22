import { describe, expect, it } from 'bun:test';
import { ForbiddenError } from '@DomainError';
import { makeUsersScenario } from '../../test-helpers';

describe('UNIT - Users Management > Create Avatar Upload Url', () => {
	it('creates a signed upload url for the current user', async () => {
		const scenario = makeUsersScenario().withAvatarUploadUrl();

		await expect(scenario.executeCreateAvatarUploadUrl()).resolves.toEqual({
			uploadUrl: 'https://example.com/upload',
			fields: { key: 'avatar' },
			fileUrl: 'https://example.com/avatar.jpg',
		});

		expect(
			scenario.mocks.storageService.generateAvatarUploadUrl,
		).toHaveBeenCalledTimes(1);
		expect(
			scenario.mocks.storageService.generateAvatarUploadUrl,
		).toHaveBeenCalledWith('1', 'image/jpeg', 10);
	});

	it('blocks invalid avatar content types', async () => {
		const scenario = makeUsersScenario();
		scenario.mocks.storageService.validateImageContentType.mockReturnValue(
			false,
		);

		expect(() => scenario.executeCreateAvatarUploadUrl()).toThrow(
			ForbiddenError,
		);
	});

	it('blocks inactive users from requesting an upload url', async () => {
		const scenario = makeUsersScenario().withAvatarUploadUrl();

		expect(() =>
			scenario.executeCreateAvatarUploadUrl({ clientStatus: 'blocked' }),
		).toThrow(ForbiddenError);
	});
});
