import { config } from 'dotenv';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const inferNodeEnv = (): string => {
	if (process.env.NODE_ENV) return process.env.NODE_ENV;
	if (process.env.BUN_ENV) return process.env.BUN_ENV;
	if (process.env.BUN_TEST) return 'test';
	return 'development';
};

const NODE_ENV = inferNodeEnv();
const envFile = `.env.${NODE_ENV}`;
const cwd = process.cwd();

for (const candidate of [envFile, '.env']) {
	const path = resolve(cwd, candidate);
	if (existsSync(path)) {
		config({ path });
		break;
	}
}
