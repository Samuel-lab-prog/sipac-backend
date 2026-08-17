/* eslint-disable max-lines-per-function */
import { prisma } from '../src/generic-subdomains/persistance/prisma/PrismaClient';
import { BcryptHashService } from '../src/shared-kernel/infra/Bcrypt';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

async function main() {
	const rl = createInterface({ input, output });
	const isInteractive = Boolean(input.isTTY && output.isTTY);

	const ask = async (label: string) => {
		const answer = await rl.question(label);
		return answer.trim();
	};

	const askRequired = async (
		label: string,
		envName: string,
	): Promise<string> => {
		const fromEnv = process.env[envName]?.trim();
		if (fromEnv) return fromEnv;
		if (!isInteractive) throw new Error(`${envName} is required`);

		while (true) {
			const value = await ask(label);
			if (value) return value;
			console.log(`${envName} is required.`);
		}
	};

	const askOptional = async (
		label: string,
		envName: string,
	): Promise<string | undefined> => {
		const fromEnv = process.env[envName]?.trim();
		if (fromEnv) return fromEnv;
		if (!isInteractive) return undefined;

		const value = await ask(label);
		if (!value) return undefined;
		return value;
	};

	try {
		const email = await askRequired('Email: ', 'ADMIN_EMAIL');
		const password = await askRequired('Senha: ', 'ADMIN_PASSWORD');

		const nameInput = await askOptional('Nome (opcional): ', 'ADMIN_NAME');
		const nicknameInput = await askOptional(
			'Nickname (opcional): ',
			'ADMIN_NICKNAME',
		);
		const bioInput = await askOptional('Bio (opcional): ', 'ADMIN_BIO');
		const avatarUrlInput = await askOptional(
			'Avatar URL (opcional): ',
			'ADMIN_AVATAR_URL',
		);

		const passwordHash = await BcryptHashService.hash(password);

		const existingByEmail = await prisma.user.findUnique({
			where: { email },
		});

		if (existingByEmail) {
			await prisma.user.update({
				where: { email },
				data: {
					role: 'admin',
					passwordHash,
					name: nameInput ?? existingByEmail.name,
					nickname: nicknameInput ?? existingByEmail.nickname,
					bio: bioInput ?? existingByEmail.bio,
					...(avatarUrlInput !== undefined
						? { avatarUrl: avatarUrlInput }
						: {}),
				},
			});

			console.log(`Admin user updated for email ${email}. Role set to admin.`);
			return;
		}

		const nickname = nicknameInput ?? 'admin';
		const existingByNickname = await prisma.user.findUnique({
			where: { nickname },
		});

		if (existingByNickname) {
			throw new Error(
				`Nickname "${nickname}" is already in use. Set ADMIN_NICKNAME to a unique value.`,
			);
		}

		const createData = {
			email,
			passwordHash,
			name: nameInput ?? 'Admin',
			nickname,
			bio: bioInput ?? 'Admin account',
			avatarUrl: avatarUrlInput ?? null,
			role: 'admin' as const,
		};

		try {
			await prisma.user.create({ data: createData });
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			// Some local/dev databases still have avatarUrl as NOT NULL.
			if (error?.code === 'P2011' && createData.avatarUrl === null) {
				await prisma.user.create({
					data: {
						...createData,
						avatarUrl: 'https://i.pravatar.cc/150?u=admin',
					},
				});
			} else {
				throw error;
			}
		}

		console.log(`Admin user created for email ${email}.`);
	} finally {
		rl.close();
	}
}

main()
	.catch((error) => {
		console.error('Failed to create admin user:', error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
