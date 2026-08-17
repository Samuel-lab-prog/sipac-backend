# Server Config Security Notes

This document summarizes what the backend already protects against and which
security controls are in place.

## Quick Start

1. Define the required production environment variables (see list below).
2. Use HTTPS in production for cookies and asset URLs.
3. Only enable cross-site cookies if strictly required.

## Environment Variables Used

### Required

- `DATABASE_URL`
- `JWT_SECRET_KEY`
- `CORS_ORIGIN` or `FRONTEND_URL` (required when `CROSS_SITE_COOKIES=true`)
- `S3_BUCKET_NAME`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_PUBLIC_BASE_URL` (if not using the default AWS bucket URL)
- `TRUST_PROXY` (if behind a proxy)
- `TRUSTED_PROXY_IPS` (required when `TRUST_PROXY=true`)
- `CSRF_ENABLED` (if using cross-site cookies)

### Optional / Defaults Available

- `AUTH_LOCKOUT_DURATION_MS`
- `AUTH_LOCKOUT_THRESHOLD`
- `AUTH_LOCKOUT_WINDOW_MS`
- `AUTH_RATE_LIMIT_DURATION_MS`
- `AUTH_RATE_LIMIT_MAX`
- `AWS_SESSION_TOKEN`
- `BCRYPT_SALT_ROUNDS`
- `BODY_LIMIT_BYTES`
- `CDN_URL_ALLOWLIST`
- `COOKIE_DOMAIN`
- `CROSS_SITE_COOKIES`
- `CSRF_ORIGIN_ALLOWLIST`
- `CSRF_SKIP_PATHS`
- `JWT_AUDIENCE`
- `JWT_ISSUER`
- `JWT_REQUIRE_CLAIMS`
- `MAX_AVATAR_UPLOAD_BYTES`
- `MAX_POEM_AUDIO_UPLOAD_BYTES`
- `NODE_ENV`
- `PORT`
- `RATE_LIMIT_DURATION_MS`
- `RATE_LIMIT_MAX`
- `RATE_LIMIT_CONTEXT_SIZE`
- `RATE_LIMIT_ERROR_JSON`
- `RATE_LIMIT_HEADERS`
- `RATE_LIMIT_SKIP_PATHS`
- `S3_SIGNED_URL_EXPIRES_IN`
- `SECURITY_HEADERS_ENABLED`

## Defaults and Missing Env Behavior

These are the defaults used by the server-config files in this folder and what
happens when environment variables are missing or invalid.

### Env Parsers (`envParsers.ts`)

- `parseBoolean({ value, fallback })`: returns the fallback if `value` is
  undefined, otherwise treats `1|true|yes|on` (case-insensitive) as `true`.
- `parseNumber({ name, value, fallback, min })`: returns the fallback if `value`
  is undefined/empty; logs a warning and falls back when `value` is not a finite
  number or is lower than `min`.
- `parseCsv({ value })`: returns a trimmed, non-empty list split by commas;
  returns an empty list when `value` is undefined.

### Core Server Settings (`config.ts`)

- `PORT`: defaults to `5000`.
- `BODY_LIMIT_BYTES`: defaults to `1_000_000` bytes.
- `SECURITY_HEADERS_ENABLED`: defaults to `true` (set to `false` to disable).
- `DATABASE_URL`: required in every environment. `NODE_ENV=development` must use
  a database/schema containing `dev` or `development`; `NODE_ENV=test` must use
  a database/schema containing `test`.

### Auth/Token Settings (`auth/config.ts`)

- `COOKIE_DOMAIN`: optional; omitted when empty.
- `CROSS_SITE_COOKIES`: defaults to `false`.
- `CSRF_ENABLED`: defaults to `false`; CSRF is also enabled automatically if
  cross-site cookies or cross-site CORS are configured.
- `JWT_SECRET_KEY`: required outside tests; defaults to `test-secret` in tests.
- `TOKEN_EXPIRATION_TIME`: defaults to `3600` seconds (constant, not an env).

### Env Validation (`validateEnv.ts`)

- `validateServerEnv()` checks required envs at startup and throws
  `MissingEnvVarError` when a required value is missing.
- Requirements:
  - `DATABASE_URL`
  - `JWT_SECRET_KEY` outside tests
  - `CORS_ORIGIN` or `FRONTEND_URL` when `CROSS_SITE_COOKIES=true`
  - `TRUSTED_PROXY_IPS` when `TRUST_PROXY=true`
- Database target validation rejects test runs pointed at dev/prod databases,
  development runs pointed at test/prod databases, and production runs pointed
  at dev/test databases.

### CORS Settings (`cors/config.ts`, `cors/variables.ts`)

- `CORS_ORIGIN`: comma-separated allowlist of origins.
- `FRONTEND_URL`: fallback single origin when `CORS_ORIGIN` is empty.
- In production, if `CROSS_SITE_COOKIES=true` and no CORS origin is configured,
  the server throws a configuration error on boot.
- In production, if CORS origins are missing (and cross-site cookies are not
  enabled), the server logs a warning and will block cross-site requests.

### Rate Limiter Settings (`rate-limiter/config.ts`, `rate-limiter/variables.ts`)

- `RATE_LIMIT_MAX`: defaults to `1000`.
- `RATE_LIMIT_DURATION_MS`: defaults to `900000` (15 minutes).
- `AUTH_RATE_LIMIT_MAX`: defaults to `20`.
- `AUTH_RATE_LIMIT_DURATION_MS`: defaults to `900000` (15 minutes).
- `RATE_LIMIT_CONTEXT_SIZE`: defaults to `10000`.
- `RATE_LIMIT_HEADERS`: defaults to `true`.
- `RATE_LIMIT_ERROR_JSON`: defaults to `true`.
- `RATE_LIMIT_SKIP_PATHS`: defaults to `/health,/metrics` (comma-separated
  list).
- `TRUST_PROXY`: defaults to `false`.
- `TRUSTED_PROXY_IPS`: defaults to empty.
- Invalid boolean/number values fall back to defaults and log a warning.
- In production, if `TRUST_PROXY=true` but `TRUSTED_PROXY_IPS` is empty, the
  server throws a configuration error on boot.

## What The Server Is Protected Against

- XSS via untrusted inputs (server-side sanitization and schema validation).
- Malformed or oversized payloads (schema validation + body size limit).
- Brute-force password guessing (bcrypt + login lockout).
- Basic CSRF (token validation on unsafe methods).
- CSRF from untrusted origins (Origin/Referer allowlist).
- Abuse spikes (global and auth-specific rate limits).
- Upload abuse (MIME allowlists + S3 presigned POST size limits).
- Unauthorized access (role/status checks and policy gates).
- Untrusted media URLs (CDN allowlist validation).

## Adopted Security Practices

- Input sanitization:
  - Global string sanitization is applied in `ELYSIA_SETTINGS` to reduce XSS
    risk.
- Input validation with strict schemas:
  - Requests validate types, limits, and formats (e.g. poem content size,
    nickname format, pagination limits).
- Body size limiting:
  - Requests are capped by `BODY_LIMIT_BYTES` (default 1 MB).
- Password hashing:
  - Bcrypt is used with a configurable cost (`BCRYPT_SALT_ROUNDS`) and a safe
    default.
- JWT handling:
  - JWTs are signed with a secret from environment (`JWT_SECRET_KEY`).
  - Optional issuer/audience/jti validation (`JWT_ISSUER`, `JWT_AUDIENCE`,
    `JWT_REQUIRE_CLAIMS`).
- Cookies:
  - HTTP-only cookies are used.
  - `SameSite` and `Secure` are set based on environment and cross-site
    configuration.
- CSRF protection:
  - A CSRF cookie is set at login.
  - Unsafe methods require `x-csrf-token` to match the cookie value.
  - Enabled by `CSRF_ENABLED=true` or when cross-site cookies are used.
  - Optional Origin/Referer allowlist (`CSRF_ORIGIN_ALLOWLIST`).
- Security headers:
  - HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
    Permissions-Policy.
  - Can be disabled with `SECURITY_HEADERS_ENABLED=false`.
- Rate limiting:
  - Global and auth-specific rate limits are enabled.
  - Proxy trust uses an allowlist to avoid spoofing.
- Error normalization:
  - Centralized error handling avoids leaking internal details.
- Upload security:
  - Presigned POSTs enforce content type and size limits on S3.
  - Allowed MIME types are restricted for image and audio uploads.
- CDN URL allowlist:
  - `avatarUrl` and `audioUrl` are validated against `CDN_URL_ALLOWLIST` when
    set.
- Access control:
  - Role and status checks are enforced in use-cases and policies.

## Notes

- If you enable cross-site cookies, CSRF is automatically enabled and required.
- If you expose public search endpoints, keep length and pattern limits in sync
  with schemas.

## Future Security Improvements

- Persist login lockout in Redis for multi-instance setups.
- Add JWT revocation (store and check `jti`).
- Audit sensitive events (login, password/email changes, uploads).
- Validate uploads after S3 (HeadObject + delete if invalid).
- Consider a WAF or application firewall for automated abuse.
