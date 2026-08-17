import type { HashServices } from '@SharedKernel/ports/HashServices';
import { prisma } from '@Prisma/PrismaClient';
import { fullUserSelect } from '../../../infra/queries-repository/selects';
import type { FullUser } from '../../../ports/models';
import { ConflictError } from '@DomainError';

export type BootstrapAdminParams = {
	email: string;
	password: string;
	name: string;
	nickname: string;
	bio: string;
	avatarUrl?: string | null;
};

type BootstrapAdminResult = {
	user: FullUser;
	created: boolean;
};

interface Dependencies {
	hashServices: HashServices;
}

export function bootstrapAdminFactory({ hashServices }: Dependencies) {
	return async function bootstrapAdmin(
		params: BootstrapAdminParams,
	): Promise<BootstrapAdminResult> {
		const { email, password, name, nickname, bio, avatarUrl } = params;
		const passwordHash = await hashServices.hash(password);

		const existingAdmin = await prisma.user.findFirst({
			where: { role: 'admin', deletedAt: null },
			select: fullUserSelect,
		});

		if (existingAdmin) {
			throw new ConflictError('Admin bootstrap already completed');
		}

		const existingByEmail = await prisma.user.findUnique({
			where: { email },
			select: { id: true, nickname: true },
		});

		if (existingByEmail && existingByEmail.nickname !== nickname) {
			const nicknameTaken = await prisma.user.findUnique({
				where: { nickname },
				select: { id: true },
			});
			if (nicknameTaken) {
				throw new ConflictError('Nickname already in use');
			}
		}

		if (existingByEmail) {
			const updated = await prisma.user.update({
				where: { id: existingByEmail.id },
				data: {
					role: 'admin',
					passwordHash,
					name,
					nickname,
					bio,
					...(avatarUrl !== undefined ? { avatarUrl } : {}),
				},
				select: fullUserSelect,
			});

			return { user: updated, created: false };
		}

		const existingByNickname = await prisma.user.findUnique({
			where: { nickname },
			select: { id: true },
		});

		if (existingByNickname) {
			throw new ConflictError('Nickname already in use');
		}

		const created = await prisma.user.create({
			data: {
				email,
				passwordHash,
				name,
				nickname,
				bio,
				avatarUrl: avatarUrl ?? null,
				role: 'admin',
			},
			select: fullUserSelect,
		});

		return { user: created, created: true };
	};
}
