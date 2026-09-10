import { Elysia, t } from 'elysia';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { localStorageRoot, pendingUploads } from './local-storage';

export const localStorageRouter = new Elysia({ prefix: '/storage' })
	.post(
		'/upload',
		async ({ body, status }) => {
			const upload = pendingUploads.get(body.token);
			if (!upload || upload.expires < Date.now())
				return status(403, 'Invalid or expired upload');
			if (
				body.file.size < 1 ||
				body.file.size > upload.maxBytes ||
				body.file.type !== upload.contentType
			)
				return status(400, 'Invalid file');
			pendingUploads.delete(body.token);
			await mkdir(localStorageRoot, { recursive: true });
			await Bun.write(join(localStorageRoot, upload.key), body.file);
			await Bun.write(
				join(localStorageRoot, `${upload.key}.json`),
				JSON.stringify({ contentType: upload.contentType }),
			);
			return status(204);
		},
		{ body: t.Object({ token: t.String(), file: t.File() }) },
	)
	.get('/files/:key', async ({ params, status }) => {
		if (
			!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(
				params.key,
			)
		)
			return status(404);
		const file = Bun.file(join(localStorageRoot, params.key));
		if (!(await file.exists())) return status(404);
		const metadata = await Bun.file(
			join(localStorageRoot, `${params.key}.json`),
		).json();
		return new Response(file, {
			headers: {
				'Content-Type': metadata.contentType,
				'X-Content-Type-Options': 'nosniff',
			},
		});
	});
