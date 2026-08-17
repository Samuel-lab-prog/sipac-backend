import jwt, { type SignOptions } from 'jsonwebtoken';
import type { TokenService, TokenPayload } from '../../ports/externalServices';
import { getJwtSecretKey } from 'server-config/config';

const secretKey = getJwtSecretKey();
const issuer =
	typeof process.env.JWT_ISSUER === 'string'
		? process.env.JWT_ISSUER
		: undefined;
const audience =
	typeof process.env.JWT_AUDIENCE === 'string'
		? process.env.JWT_AUDIENCE
		: undefined;
const requireJwtClaims = process.env.JWT_REQUIRE_CLAIMS === 'true';

function generateToken(payload: TokenPayload, expiresIn: number): string {
	const jwtId = crypto.randomUUID();
	const options: SignOptions = {
		algorithm: 'HS256',
		expiresIn,
		jwtid: jwtId,
	};
	if (issuer) options.issuer = issuer;
	if (audience) options.audience = audience;
	return jwt.sign(payload, secretKey, options);
}

function isValidTokenPayload(payload: unknown): payload is TokenPayload {
	return (
		typeof payload === 'object' &&
		payload !== null &&
		'clientId' in payload &&
		typeof payload.clientId === 'number' &&
		'email' in payload &&
		typeof payload.email === 'string' &&
		'role' in payload &&
		typeof payload.role === 'string'
	);
}

function verifyToken(token: string): TokenPayload | null {
	try {
		const verifyOptions: jwt.VerifyOptions = {
			ignoreExpiration: false,
		};
		if (issuer) verifyOptions.issuer = issuer;
		if (audience) verifyOptions.audience = audience;
		const decoded = jwt.verify(token, secretKey, verifyOptions);
		const shouldRequireClaims =
			requireJwtClaims || Boolean(issuer) || Boolean(audience);
		if (
			shouldRequireClaims &&
			typeof decoded === 'object' &&
			decoded !== null
		) {
			const claims = decoded as jwt.JwtPayload;
			if (!claims.iss || !claims.aud || !claims.jti) return null;
		}
		return isValidTokenPayload(decoded) ? decoded : null;
	} catch {
		return null;
	}
}

function fakeGenerateToken(payload: TokenPayload, _expiresIn: number): string {
	const role = payload.role;
	const email = payload.email;
	const clientId = payload.clientId;
	const tokenType = payload.tokenType;
	return `${tokenType}-${role}-${email}-${clientId}`;
}

function fakeVerifyToken(token: string): TokenPayload | null {
	const parts = token.split('-');
	if (parts.length !== 4) return null;
	const [tokenType, role, email, clientIdStr] = parts;
	const clientId = Number(clientIdStr);
	if (
		isNaN(clientId) ||
		(tokenType !== 'access' && tokenType !== 'refresh') ||
		(role !== 'admin' && role !== 'author' && role !== 'moderator') ||
		!email
	)
		return null;
	return { role, email, clientId, tokenType };
}

export const JwtTokenService: TokenService = {
	generateToken,
	verifyToken,
};

export const FakeJwtTokenService: TokenService = {
	generateToken: fakeGenerateToken,
	verifyToken: fakeVerifyToken,
};
