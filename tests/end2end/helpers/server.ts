/* eslint-disable require-await */
import { spawn, type ChildProcess } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

export type TestServer = {
	process: ChildProcess;
	baseURL: string;
	port: number;
};

async function waitForServer(baseURL: string, timeoutMs = 30_000) {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		try {
			const res = await fetch(`${baseURL}/api/v1/auth/login`, {
				method: 'OPTIONS',
			});
			if (res.ok || res.status === 404 || res.status === 405) return;
		} catch {
			// Ignore until timeout.
		}
		await delay(250);
	}
	throw new Error(`Server did not become ready at ${baseURL}`);
}

type StartServerOptions = {
	port?: number;
	env?: Record<string, string | undefined>;
};

export async function startServer(
	options: StartServerOptions = {},
): Promise<TestServer> {
	const port = options.port ?? Number(process.env.E2E_PORT ?? 5101);
	const baseURL = `http://127.0.0.1:${port}`;

	const child = spawn('bun', ['src/Server.ts'], {
		cwd: process.cwd(),
		env: {
			...process.env,
			...(options.env ?? {}),
			NODE_ENV: 'test',
			PORT: String(port),
			JWT_ISSUER: baseURL,
			JWT_AUDIENCE: baseURL,
		},
		stdio: 'pipe',
	});

	child.on('error', (error) => {
		throw error;
	});

	await waitForServer(baseURL);

	return { process: child, baseURL, port };
}

export async function stopServer(server: TestServer) {
	server.process.kill();
}
