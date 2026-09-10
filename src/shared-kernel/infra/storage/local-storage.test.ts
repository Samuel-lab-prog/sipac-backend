import { afterAll, expect, test } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const originalDir = process.env.LOCAL_STORAGE_DIR;
const directory = await mkdtemp(join(tmpdir(), 'agias-storage-test-'));
process.env.LOCAL_STORAGE_DIR = directory;
const { createLocalStorageService, pendingUploads } = await import(
	'./local-storage'
);
const { localStorageRouter } = await import('./local-storage-router');
afterAll(async () => {
	if (originalDir === undefined) delete process.env.LOCAL_STORAGE_DIR;
	else process.env.LOCAL_STORAGE_DIR = originalDir;
	await rm(directory, { recursive: true, force: true });
});

test('local upload saves a file and rejects reuse of the upload token', async () => {
	const upload = await createLocalStorageService().generateFileUploadUrl(
		'attachments',
		'test.pdf',
		'application/pdf',
	);
	const body = new FormData();
	body.set('token', upload.fields.token!);
	body.set(
		'file',
		new File(['%PDF-test'], 'test.pdf', { type: 'application/pdf' }),
	);
	const request = () =>
		new Request('http://localhost/storage/upload', { method: 'POST', body });
	expect((await localStorageRouter.handle(request())).status).toBe(204);
	const key = upload.fileUrl.split('/').pop();
	const result = await localStorageRouter.handle(
		new Request(`http://localhost/storage/files/${key}`),
	);
	expect(result.status).toBe(200);
	expect(await result.text()).toBe('%PDF-test');
	expect((await localStorageRouter.handle(request())).status).toBe(403);
});

test('local upload rejects expired tokens', async () => {
	const upload =
		await createLocalStorageService().generateAvatarUploadUrl('user');
	pendingUploads.get(upload.fields.token!)!.expires = 0;
	const body = new FormData();
	body.set('token', upload.fields.token!);
	body.set('file', new File(['image'], 'test.jpg', { type: 'image/jpeg' }));
	expect(
		(
			await localStorageRouter.handle(
				new Request('http://localhost/storage/upload', {
					method: 'POST',
					body,
				}),
			)
		).status,
	).toBe(403);
});
