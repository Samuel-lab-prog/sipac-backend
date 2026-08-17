import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export function withTemporaryDomainFile<T>(
	testRootName: string,
	relativeFile: string,
	content: string,
	run: (file: string) => T,
): T {
	const root = path.join(process.cwd(), 'src', 'domains', testRootName);
	const file = path.join(process.cwd(), relativeFile);

	rmSync(root, { recursive: true, force: true });
	mkdirSync(path.dirname(file), { recursive: true });
	writeFileSync(file, content);

	try {
		return run(file);
	} finally {
		rmSync(root, { recursive: true, force: true });
	}
}
