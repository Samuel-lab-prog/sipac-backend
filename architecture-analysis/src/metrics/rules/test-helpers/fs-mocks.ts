import { spyOn } from 'bun:test';
import fs from 'node:fs';

export function withMockedReadFile<T>(content: string, run: () => T): T {
	const readFileSpy = spyOn(fs, 'readFileSync').mockReturnValue(content);
	try {
		return run();
	} finally {
		readFileSpy.mockRestore();
	}
}
