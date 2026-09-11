import '../../../../scripts/load-local-env';
import { prisma } from '../prisma/prisma-client';
import { runStudentSeeds } from './index';

runStudentSeeds(prisma, process.argv.slice(2))
	.then((result) => console.log(JSON.stringify(result, null, 2)))
	.catch((error: unknown) => {
		console.error(error instanceof Error ? error.message : 'Seed failed');
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
