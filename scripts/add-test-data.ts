import bcrypt from 'bcryptjs';
import { prisma } from '../src/generic-subdomains/persistance/prisma/PrismaClient';

const NODE_ENV = process.env.NODE_ENV ?? 'development';
const ALLOW_PROD_SEED = process.env.ALLOW_PROD_SEED === 'true';

function assertSafeEnvironment() {
	if (NODE_ENV === 'production' && !ALLOW_PROD_SEED) {
		throw new Error(
			'Refusing to seed test data in production. Set ALLOW_PROD_SEED=true to override.',
		);
	}
}

type UserSeed = {
	email: string;
	passwordHash: string;
	name: string;
	nickname: string;
	bio: string;
	avatarUrl: string;
	role: 'author' | 'moderator' | 'admin';
};

const USERS_TO_CREATE = 40;
const POEMS_TO_CREATE = 220;
const FRIEND_REQUESTS_TO_CREATE = 160;

const WORDS = [
	'silencio',
	'tempo',
	'memoria',
	'noite',
	'vento',
	'caminho',
	'eco',
	'sol',
	'sombra',
	'vida',
	'caos',
	'paz',
	'amor',
	'vazio',
	'esperanca',
];

const FIRST_NAMES = [
	'Lucas',
	'Marina',
	'Rafael',
	'Beatriz',
	'Pedro',
	'Ana',
	'Gabriel',
	'Camila',
	'Bruno',
	'Julia',
	'Diego',
	'Larissa',
	'Paulo',
	'Renata',
];

const LAST_NAMES = [
	'Ferreira',
	'Costa',
	'Almeida',
	'Santos',
	'Rocha',
	'Ribeiro',
	'Martins',
	'Silva',
];

const BIOS = [
	'Coffee lover and tech enthusiast.',
	'Writer and nature admirer.',
	'Lover of books and art.',
	'Sharing thoughts and small poems.',
	'Just exploring new ideas.',
	'Dreamer and storyteller.',
	'Minimalist and curious mind.',
];

function pick<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomPastDate(maxDays = 120): Date {
	const ms = Math.floor(Math.random() * maxDays * 24 * 60 * 60 * 1000);
	return new Date(Date.now() - ms);
}

function slugify(text: string): string {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)+/g, '');
}

function poemContent() {
	return `${pick(WORDS)} ${pick(WORDS)}\n${pick(WORDS)} ${pick(WORDS)}\n${pick(WORDS)} ${pick(WORDS)}`;
}

function randomRole(): 'author' | 'moderator' | 'admin' {
	const roll = Math.random();
	if (roll < 0.78) return 'author';
	if (roll < 0.95) return 'moderator';
	return 'admin';
}

async function createUsers(): Promise<number[]> {
	const suffix = `${Date.now()}`;
	const passwordHash = await bcrypt.hash('defaultpassword', 10);
	const users: UserSeed[] = Array.from({ length: USERS_TO_CREATE }).map(
		(_, index) => {
			const first = pick(FIRST_NAMES);
			const last = pick(LAST_NAMES);
			const nickname = `${first.toLowerCase()}${last.toLowerCase()}${suffix}${index}`;

			return {
				email: `${nickname}@gmail.com`,
				passwordHash,
				name: `${first} ${last}`,
				nickname,
				bio: pick(BIOS),
				avatarUrl: `https://i.pravatar.cc/150?u=${nickname}`,
				role: randomRole(),
			};
		},
	);

	await prisma.user.createMany({ data: users });
	const created = await prisma.user.findMany({
		where: { nickname: { contains: suffix } },
		select: { id: true },
	});

	return created.map((u) => u.id);
}

async function createPoems(allUserIds: number[]) {
	const nowSuffix = Date.now();
	for (let i = 0; i < POEMS_TO_CREATE; i++) {
		const authorId = pick(allUserIds);
		const title = `${pick(WORDS)} ${pick(WORDS)} ${i + 1}`;
		const createdAt = randomPastDate();
		await prisma.poem.create({
			data: {
				title,
				slug: slugify(`${title}-${authorId}-${nowSuffix}`),
				excerpt: poemContent().split('\n')[0],
				content: poemContent(),
				visibility: pick(['public', 'friends', 'private'] as const),
				status: pick(['draft', 'published'] as const),
				moderationStatus: pick(['pending', 'approved', 'rejected'] as const),
				author: { connect: { id: authorId } },
				createdAt,
				tags: {
					connectOrCreate: Array.from(
						new Set([pick(WORDS), pick(WORDS), pick(WORDS)]),
					).map((name) => ({
						where: { name },
						create: { name },
					})),
				},
			},
		});
	}
}

function pairKey(a: number, b: number) {
	return `${a}-${b}`;
}

async function createFriendRequests(allUserIds: number[]) {
	const existing = await prisma.friendshipRequest.findMany({
		select: { requesterId: true, addresseeId: true },
	});
	const used = new Set(
		existing.map((r) => pairKey(r.requesterId, r.addresseeId)),
	);

	const batch: { requesterId: number; addresseeId: number; createdAt: Date }[] =
		[];
	let attempts = 0;
	while (
		batch.length < FRIEND_REQUESTS_TO_CREATE &&
		attempts < FRIEND_REQUESTS_TO_CREATE * 40
	) {
		attempts += 1;
		const requesterId = pick(allUserIds);
		const addresseeId = pick(allUserIds);
		if (requesterId === addresseeId) continue;
		const key = pairKey(requesterId, addresseeId);
		if (used.has(key)) continue;
		used.add(key);
		batch.push({ requesterId, addresseeId, createdAt: randomPastDate(40) });
	}

	if (batch.length) {
		await prisma.friendshipRequest.createMany({
			data: batch,
			skipDuplicates: true,
		});
	}

	return batch.length;
}

async function main() {
	assertSafeEnvironment();
	const usersBefore = await prisma.user.count();
	const poemsBefore = await prisma.poem.count();
	const requestsBefore = await prisma.friendshipRequest.count();

	const newUserIds = await createUsers();
	const allUsers = await prisma.user.findMany({ select: { id: true } });
	const allUserIds = allUsers.map((u) => u.id);

	await createPoems(allUserIds);
	const createdRequests = await createFriendRequests(allUserIds);

	const usersAfter = await prisma.user.count();
	const poemsAfter = await prisma.poem.count();
	const requestsAfter = await prisma.friendshipRequest.count();

	console.log('Done seeding extra test data:');
	console.log(`Users: +${usersAfter - usersBefore}`);
	console.log(`Poems: +${poemsAfter - poemsBefore}`);
	console.log(
		`Friend requests: +${requestsAfter - requestsBefore} (attempted ${createdRequests})`,
	);
	console.log(`New user ids sample: ${newUserIds.slice(0, 10).join(', ')}`);
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
