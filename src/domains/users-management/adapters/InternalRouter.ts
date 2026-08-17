import { AppError, appErrorSchema } from '@AppError';
import { Elysia } from 'elysia';
import type { FullUser } from '../ports/models';
import { CreateUserSchema, FullUserSchema } from '../ports/schemas/Index';
import type { BootstrapAdminParams } from '../use-cases/commands/bootstrap-admin/execute';

export type UsersInternalServices = {
	bootstrapAdmin: (params: BootstrapAdminParams) => Promise<{
		user: FullUser;
		created: boolean;
	}>;
};

const BOOTSTRAP_HEADER = 'x-bootstrap-secret';
const BOOTSTRAP_ALLOWED_IPS = (process.env.BOOTSTRAP_ALLOWED_IPS ?? '')
	.split(',')
	.map((ip) => ip.trim())
	.filter(Boolean);

function getClientIp(request: Request): string {
	const forwarded = request.headers.get('x-forwarded-for') ?? '';
	if (forwarded) {
		const first = forwarded.split(',')[0]?.trim();
		if (first) return first;
	}
	return (
		request.headers.get('cf-connecting-ip') ??
		request.headers.get('x-real-ip') ??
		request.headers.get('x-client-ip') ??
		''
	);
}

function assertBootstrapIpAllowed(request: Request): void {
	if (BOOTSTRAP_ALLOWED_IPS.length === 0) {
		throw new AppError({
			statusCode: 403,
			message: 'Bootstrap IP allowlist is empty',
			code: 'FORBIDDEN',
		});
	}
	const clientIp = getClientIp(request);
	if (!clientIp || !BOOTSTRAP_ALLOWED_IPS.includes(clientIp)) {
		throw new AppError({
			statusCode: 403,
			message: 'Bootstrap IP is not allowed',
			code: 'FORBIDDEN',
		});
	}
}

export function createUsersInternalRouter(services: UsersInternalServices) {
	return new Elysia({ prefix: '/internal' }).post(
		'/bootstrap-admin',
		async ({ request, body, set }) => {
			const expectedSecret = process.env.BOOTSTRAP_SECRET ?? '';
			const providedSecret = request.headers.get(BOOTSTRAP_HEADER) ?? '';

			if (!expectedSecret || providedSecret !== expectedSecret) {
				throw new AppError({
					statusCode: 403,
					message: 'Bootstrap secret is invalid',
					code: 'FORBIDDEN',
				});
			}

			assertBootstrapIpAllowed(request);

			const result = await services.bootstrapAdmin(body);
			set.status = result.created ? 201 : 200;
			return result.user;
		},
		{
			body: CreateUserSchema,
			response: {
				200: FullUserSchema,
				201: FullUserSchema,
				403: appErrorSchema,
				409: appErrorSchema,
			},
			detail: {
				summary: 'Bootstrap Admin',
				description:
					'Creates the first admin user or promotes an existing user.',
				tags: ['Internal'],
			},
		},
	);
}
