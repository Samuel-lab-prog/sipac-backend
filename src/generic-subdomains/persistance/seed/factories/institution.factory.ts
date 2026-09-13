import type { SeedDb } from '../config';

/**
 * The development database represents the first AGIAS deployment: IFRS Campus
 * Erechim. The stable ids make the migration from pre-campus records explicit
 * and keep all scenario seeds in the same operational scope.
 */
export async function seedInstitution(db: SeedDb) {
	const institution = await db.institution.upsert({
		where: { id: 1 },
		update: {
			name: 'Instituto Federal do Rio Grande do Sul',
			acronym: 'IFRS',
			configured: true,
		},
		create: {
			id: 1,
			name: 'Instituto Federal do Rio Grande do Sul',
			acronym: 'IFRS',
			configured: true,
		},
	});
	const campus = await db.campus.upsert({
		where: { id: 1 },
		update: {
			institutionId: institution.id,
			name: 'Campus Erechim',
			city: 'Erechim',
			state: 'RS',
			address: 'Rua Domingos Zanella, 104',
		},
		create: {
			id: 1,
			institutionId: institution.id,
			name: 'Campus Erechim',
			city: 'Erechim',
			state: 'RS',
			address: 'Rua Domingos Zanella, 104',
		},
	});
	return { institution, campus };
}
