type BooleanEnvParserInput = {
	value: string | undefined;
	fallback: boolean;
};

type NumberEnvParserInput = {
	name: string;
	value: string | undefined;
	fallback: number;
	min: number;
};

type CsvEnvParserInput = {
	value: string | undefined;
};

/**
 * Parses a boolean-like environment variable.
 * If the value is undefined, returns the provided fallback.
 * Truthy values are: 1, true, yes, on (case-insensitive).
 */
export const parseBoolean = ({
	value,
	fallback,
}: BooleanEnvParserInput): boolean => {
	if (value === undefined) return fallback;
	return /^(1|true|yes|on)$/i.test(value);
};

/**
 * Parses a numeric environment variable with validation.
 * If the value is undefined or empty, returns the provided fallback.
 * If the value is not a finite number or below the minimum, logs a warning
 * and returns the fallback.
 */
export const parseNumber = ({
	name,
	value,
	fallback,
	min,
}: NumberEnvParserInput): number => {
	if (value === undefined || value === '') return fallback;
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed < min) {
		console.warn(
			`Invalid ${name} value "${value}". Falling back to ${fallback}.`,
		);
		return fallback;
	}
	return parsed;
};

/**
 * Parses a comma-separated environment variable into a string list.
 * Trims entries and removes empty values. Returns an empty list if undefined.
 */
export const parseCsv = ({ value }: CsvEnvParserInput): string[] =>
	value === undefined
		? []
		: value
				.split(',')
				.map((entry) => entry.trim())
				.filter(Boolean);
