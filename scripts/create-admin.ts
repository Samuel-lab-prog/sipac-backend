import './load-local-env';

import { prisma } from '../src/generic-subdomains/persistance/prisma/prisma-client';
import { BcryptHashService } from '../src/shared-kernel/infra/encrypting/bcrypt';
import { validateServerEnv } from '../src/server-config/utils/validateEnv';

function normalizeDigits(value: string) {
	return value.replace(/\D/g, '');
}

async function main() {
	validateServerEnv({ silent: true });

	const email = process.env.ADMIN_EMAIL;
	const name = process.env.ADMIN_NAME ?? 'Administrador';
	const nickname = process.env.ADMIN_NICKNAME ?? 'admin';
	const cpf = process.env.ADMIN_CPF;
	const rg = process.env.ADMIN_RG ?? '0000000';
	const password = process.env.ADMIN_PASSWORD;

	if (!email) throw new Error('Missing admin email. Use ADMIN_EMAIL.');
	if (!cpf) throw new Error('Missing admin CPF. Use ADMIN_CPF.');
	if (!password) throw new Error('Missing admin password. Use ADMIN_PASSWORD.');

	const normalizedCpf = normalizeDigits(cpf);

	const existingAdmin = await prisma.user.findFirst({
		where: {
			OR: [{ email }, { cpf: normalizedCpf }],
			deletedAt: null,
		},
		select: {
			id: true,
			email: true,
			cpf: true,
			role: true,
		},
	});

	if (existingAdmin) {
		console.log(
			`Admin/account already exists (id=${existingAdmin.id}, email=${existingAdmin.email}, cpf=${existingAdmin.cpf}, role=${existingAdmin.role}).`,
		);
		return;
	}

	const passwordHash = await BcryptHashService.hash(password);

	const admin = await prisma.user.create({
		data: {
			email,
			passwordHash,
			name,
			nickname,
			rg,
			cpf: normalizedCpf,
			role: 'admin',
			status: 'active',
		},
		select: {
			id: true,
			email: true,
			name: true,
			nickname: true,
			cpf: true,
			role: true,
			status: true,
			createdAt: true,
		},
	});

	console.log('Admin created successfully.');
	console.log(
		JSON.stringify(
			{
				admin,
				notes: 'Store the password securely; it is not printed by the system.',
			},
			null,
			2,
		),
	);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
