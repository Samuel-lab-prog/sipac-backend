import { test, expect } from '@playwright/test';
import bcrypt from 'bcryptjs';
import { startServer, stopServer, type TestServer } from './helpers/server';
import { clearDatabase } from '../../src/generic-subdomains/persistance/prisma/ClearDatabase.ts';
import { prisma } from '@Prisma/PrismaClient.ts';

type Credentials = {
	email: string;
	password: string;
};

const creds: Credentials = {
	email: 'e2e.user@olapoesia.dev',
	password: 'strong-password-123',
};

let server: TestServer;
let baseURL = '';
let userId = 0;

async function createUser() {
	const passwordHash = await bcrypt.hash(creds.password, 10);
	const user = await prisma.user.create({
		data: {
			email: creds.email,
			passwordHash,
			nickname: 'e2e_user',
			name: 'E2E User',
			bio: 'E2E user bio',
			avatarUrl: 'http://example.com/avatar.png',
			role: 'author',
		},
		select: { id: true },
	});
	userId = user.id;
}

test.describe.serial('E2E Auth (cookies)', () => {
	test.beforeAll(async () => {
		await clearDatabase();
		server = await startServer({
			env: {
				CSRF_ENABLED: 'true',
				CSRF_ORIGIN_ALLOWLIST: '',
			},
		});
		baseURL = server.baseURL;
		await createUser();
	});

	test.afterAll(async () => {
		await prisma.$disconnect();
		await stopServer(server);
	});

	test('login sets token and csrf cookies with expected attributes', async ({
		page,
		context,
	}) => {
		await page.goto(baseURL);

		const loginResult = await page.evaluate(
			async (payload) => {
				const res = await fetch(`${payload.baseURL}/api/v1/auth/login`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload.creds),
					credentials: 'include',
				});
				return { status: res.status, body: await res.json() };
			},
			{ baseURL, creds },
		);

		expect(loginResult.status).toBe(200);
		expect(loginResult.body).toHaveProperty('id');

		const cookies = await context.cookies(baseURL);
		const tokenCookie = cookies.find((c) => c.name === 'token');
		const csrfCookie = cookies.find((c) => c.name === 'csrf_token');

		expect(tokenCookie).toBeTruthy();
		expect(csrfCookie).toBeTruthy();

		expect(tokenCookie?.httpOnly).toBe(true);
		expect(tokenCookie?.sameSite).toBe('Lax');
		expect(tokenCookie?.secure).toBe(false);
		expect(tokenCookie?.expires ?? 0).toBeGreaterThan(0);

		expect(csrfCookie?.httpOnly).toBe(false);
		expect(csrfCookie?.sameSite).toBe('Lax');
	});

	test('token cookie is httpOnly but csrf cookie is readable by JS', async ({
		page,
	}) => {
		await page.goto(baseURL);

		await page.evaluate(
			async (payload) => {
				await fetch(`${payload.baseURL}/api/v1/auth/login`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload.creds),
					credentials: 'include',
				});
			},
			{ baseURL, creds },
		);

		const cookieNames: string[] = await page.evaluate(() => {
			const doc = (globalThis as unknown as { document?: { cookie?: string } })
				.document;
			return (doc?.cookie ?? '')
				.split(';')
				.map((c: string) => c.trim().split('=')[0])
				.filter((name): name is string => Boolean(name));
		});
		expect(cookieNames).toContain('csrf_token');
		expect(cookieNames).not.toContain('token');
	});

	test('cookies persist after closing the browser context', async ({
		browser,
	}) => {
		const contextA = await browser.newContext();
		const pageA = await contextA.newPage();
		await pageA.goto(baseURL);

		await pageA.evaluate(
			async (payload) => {
				await fetch(`${payload.baseURL}/api/v1/auth/login`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload.creds),
					credentials: 'include',
				});
			},
			{ baseURL, creds },
		);

		const storagePath = '.e2e-storage.json';
		await contextA.storageState({ path: storagePath });
		await contextA.close();

		const contextB = await browser.newContext({ storageState: storagePath });
		const pageB = await contextB.newPage();
		await pageB.goto(baseURL);

		const profile = await pageB.evaluate(
			async (payload) => {
				const res = await fetch(
					`${payload.baseURL}/api/v1/users/${payload.userId}/profile`,
					{
						method: 'GET',
						credentials: 'include',
					},
				);
				return { status: res.status, body: await res.json() };
			},
			{ baseURL, userId },
		);

		expect(profile.status).toBe(200);
		expect(profile.body).toHaveProperty('id', userId);

		await contextB.close();
	});
});
