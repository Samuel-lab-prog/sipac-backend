/* eslint-disable max-lines-per-function */
import {
	NotFoundError,
	UnprocessableEntityError,
	ForbiddenError,
} from '@DomainError';

type ResourceType =
	| string
	| number
	| boolean
	| object
	| null
	| undefined
	| unknown;

export function ensure(resource: ResourceType, message = 'Resource not found') {
	let current = resource;

	const ensureString = (customMsg?: string) => {
		if (typeof current !== 'string') {
			throw new UnprocessableEntityError(
				customMsg || 'Resource must be a string',
			);
		}
		return current as string;
	};

	const ensureNumber = (customMsg?: string) => {
		if (typeof current !== 'number') {
			throw new UnprocessableEntityError(
				customMsg || 'Resource must be a number',
			);
		}
		return current as number;
	};

	return {
		value() {
			return current;
		},

		notNull(customMsg?: string) {
			if (current === null) throw new NotFoundError(customMsg || message);
			return this;
		},

		notUndefined(customMsg?: string) {
			if (current === undefined) throw new NotFoundError(customMsg || message);
			return this;
		},

		trim() {
			if (typeof current === 'string') current = current.trim();
			return this;
		},

		minLength(min: number, customMsg?: string) {
			const str = ensureString();
			if (str.length < min)
				throw new UnprocessableEntityError(
					customMsg || `Content must be at least ${min} characters long`,
				);
			return this;
		},

		maxLength(max: number, customMsg?: string) {
			const str = ensureString();
			if (str.length > max)
				throw new UnprocessableEntityError(
					customMsg || `Content cannot exceed ${max} characters`,
				);
			return this;
		},

		bannedWords(words: string[], customMsg?: string) {
			const str = ensureString();
			const found = words.filter((w) => str.includes(w));
			if (found.length > 0)
				throw new UnprocessableEntityError(
					customMsg || `Content cannot include: ${found.join(', ')}`,
				);
			return this;
		},

		minValue(min: number, customMsg?: string) {
			const num = ensureNumber();
			if (num < min)
				throw new UnprocessableEntityError(
					customMsg || `Value must be at least ${min}`,
				);
			return this;
		},

		maxValue(max: number, customMsg?: string) {
			const num = ensureNumber();
			if (num > max)
				throw new UnprocessableEntityError(
					customMsg || `Value cannot exceed ${max}`,
				);
			return this;
		},

		isTrue(customMsg?: string) {
			if (current !== true)
				throw new ForbiddenError(customMsg || 'Expected resource to be true');
			return this;
		},

		isFalse(customMsg?: string) {
			if (current !== false)
				throw new ForbiddenError(customMsg || 'Expected resource to be false');
			return this;
		},
	};
}
