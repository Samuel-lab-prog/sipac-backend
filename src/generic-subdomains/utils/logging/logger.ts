import { getLogLevel } from 'server-config/config';
import { Writable } from 'node:stream';
import { inspect } from 'node:util';
import pino from 'pino';

const isBunRuntime = typeof Bun !== 'undefined';
const shouldPrettyPrint = isBunRuntime && getLogLevel() === 'debug';

function createPrettyStream() {
	let buffer = '';
	const useColor = Boolean(process.stdout.isTTY);

	return new Writable({
		write(chunk, _encoding, callback) {
			buffer += chunk.toString();
			const lines = buffer.split('\n');
			buffer = lines.pop() ?? '';

			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;
				process.stdout.write(formatLogLine(trimmed, useColor));
			}

			callback();
		},
		final(callback) {
			const trimmed = buffer.trim();
			if (trimmed) process.stdout.write(formatLogLine(trimmed, useColor));
			buffer = '';
			callback();
		},
	});
}

function formatLogLine(rawLine: string, useColor: boolean): string {
	try {
		const entry = JSON.parse(rawLine) as Record<string, unknown>;
		const level = formatLevel(entry.level, useColor);
		const time = formatTime(entry.time);
		const scope = formatScope(entry.name, useColor);
		const message = formatMessage(entry.msg, useColor);
		const extras = formatExtras(entry, useColor);

		return `${time} ${level}${scope} ${message}${extras}\n`;
	} catch {
		return `${rawLine}\n`;
	}
}

function formatLevel(level: unknown, useColor: boolean): string {
	const levelNumber = typeof level === 'number' ? level : 30;
	const label =
		levelNumber >= 60
			? 'FATAL'
			: levelNumber >= 50
				? 'ERROR'
				: levelNumber >= 40
					? 'WARN'
					: levelNumber >= 30
						? 'INFO'
						: levelNumber >= 20
							? 'DEBUG'
							: 'TRACE';

	if (!useColor) return `[${label}]`;

	const colors: Record<string, string> = {
		TRACE: '\u001b[90m',
		DEBUG: '\u001b[36m',
		INFO: '\u001b[32m',
		WARN: '\u001b[33m',
		ERROR: '\u001b[31m',
		FATAL: '\u001b[35m',
	};

	return `${colors[label] ?? ''}[${label}]\u001b[0m`;
}

function formatTime(time: unknown): string {
	const date = typeof time === 'number' ? new Date(time) : new Date();
	return date.toISOString().slice(11, 23);
}

function formatScope(name: unknown, useColor: boolean): string {
	if (typeof name !== 'string' || name.trim().length === 0) return '';

	const value = `[${name}]`;
	if (!useColor) return ` ${value}`;

	return ` \u001b[90m${value}\u001b[0m`;
}

function formatMessage(message: unknown, useColor: boolean): string {
	if (typeof message !== 'string' || message.trim().length === 0) {
		return useColor ? '\u001b[90m(no message)\u001b[0m' : '(no message)';
	}

	return message;
}

function formatExtras(
	entry: Record<string, unknown>,
	useColor: boolean,
): string {
	const ignoredKeys = new Set(['level', 'time', 'msg', 'pid', 'hostname', 'v']);
	const extras = Object.fromEntries(
		Object.entries(entry).filter(([key]) => !ignoredKeys.has(key)),
	);

	if (Object.keys(extras).length === 0) return '';

	const rendered = inspect(extras, {
		colors: useColor,
		depth: 6,
		breakLength: 80,
		compact: false,
		sorted: true,
	});

	return `\n${indentBlock(rendered)}`;
}

function indentBlock(value: string) {
	return value
		.split('\n')
		.map((line) => `  ${line}`)
		.join('\n');
}

export const log = shouldPrettyPrint
	? pino({ level: getLogLevel() }, createPrettyStream())
	: pino({ level: getLogLevel() });
