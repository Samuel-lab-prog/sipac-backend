const LOOPBACK_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);

function parseOrigin(origin: string): URL | null {
	try {
		return new URL(origin);
	} catch {
		return null;
	}
}

function isLoopbackHost(hostname: string): boolean {
	return LOOPBACK_HOSTS.has(hostname);
}

function areLoopbackOriginsEquivalent(candidate: string, allowed: string): boolean {
	if (candidate === allowed) return true;

	const candidateUrl = parseOrigin(candidate);
	const allowedUrl = parseOrigin(allowed);
	if (!candidateUrl || !allowedUrl) return false;

	return (
		candidateUrl.protocol === allowedUrl.protocol &&
		candidateUrl.port === allowedUrl.port &&
		isLoopbackHost(candidateUrl.hostname) &&
		isLoopbackHost(allowedUrl.hostname)
	);
}

export function originMatchesAllowlist(origin: string, allowlist: string[]): boolean {
	return allowlist.some((allowedOrigin) =>
		areLoopbackOriginsEquivalent(origin, allowedOrigin),
	);
}
