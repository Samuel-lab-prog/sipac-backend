import { UnprocessableEntityError } from '@DomainError';

const CDN_URL_ALLOWLIST = (process.env.CDN_URL_ALLOWLIST ?? '')
	.split(',')
	.map((url) => url.trim())
	.filter(Boolean);
const NODE_ENV = process.env.NODE_ENV ?? 'development';

function isAllowedCdnUrl(value: string): boolean {
	if (NODE_ENV === 'test') return true;
	if (CDN_URL_ALLOWLIST.length === 0) return true;
	try {
		const origin = new URL(value).origin;
		return CDN_URL_ALLOWLIST.includes(origin);
	} catch {
		return false;
	}
}

export function ensureAllowedCdnUrl(value: string, fieldName: string) {
	if (!isAllowedCdnUrl(value)) {
		throw new UnprocessableEntityError(
			`${fieldName} must use an approved CDN origin`,
		);
	}
}
