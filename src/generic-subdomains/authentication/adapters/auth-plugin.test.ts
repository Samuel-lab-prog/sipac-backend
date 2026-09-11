import { expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { createAuthPlugin } from './auth-plugin';

it('keeps concurrent staff and student identities isolated while a handler awaits', async () => {
	let releaseStaff!: () => void;
	let staffStarted!: () => void;
	const entered = new Promise<void>((resolve) => {
		staffStarted = resolve;
	});
	const waitForStudent = new Promise<void>((resolve) => {
		releaseStaff = resolve;
	});
	const app = new Elysia()
		.use(
			createAuthPlugin({
				authenticate: async (token) => ({
					id: token === 'staff' ? 1 : 2,
					role: token === 'staff' ? 'staff' : 'student',
					status: 'active',
				}),
			}),
		)
		.get('/identity', async ({ auth }) => {
			if (auth.clientRole === 'staff') {
				staffStarted();
				await waitForStudent;
			}
			return { id: auth.clientId, role: auth.clientRole };
		});
	const staff = app.handle(
		new Request('http://localhost/identity', {
			headers: { cookie: 'token=staff' },
		}),
	);
	await entered;
	try {
		const student = await app.handle(
			new Request('http://localhost/identity', {
				headers: { cookie: 'token=student' },
			}),
		);
		expect(await student.json()).toEqual({ id: 2, role: 'student' });
	} finally {
		releaseStaff();
	}
	expect(await (await staff).json()).toEqual({ id: 1, role: 'staff' });
});
