export const referenceCohort = {
	name: 'Informática — Turma A/2026',
	code: 'DEV-AGIAS-REFERENCE-2',
	year: 2026,
	term: 2,
	firstMonday: '2026-08-03',
	lastDay: '2026-12-11',
	lessonMinutes: 100,
	times: ['07:30', '09:20', '11:10'],
	excludedDates: ['2026-09-07', '2026-10-12', '2026-11-02', '2026-11-20'],
} as const;

/** Fictional people. Stable ordering also defines reproducible learning situations. */
export const referenceStudents = [
	'Ana Luiza Costa',
	'Bruno Henrique Lima',
	'Carolina Mendes',
	'Diego Santos',
	'Eduarda Rocha',
	'Felipe Nunes',
	'Gabriela Souza',
	'Hugo Ferreira',
	'Isabela Teixeira',
	'João Victor Reis',
	'Larissa Fernandes',
	'Lucas Pereira',
	'Manuela Alves',
	'Miguel Barbosa',
	'Natália Castro',
	'Otávio Cardoso',
	'Paula Andrade',
	'Rafael Dias',
	'Sofia Monteiro',
	'Vinícius Ramos',
	'Yasmin Lopes',
	'Caio Duarte',
	'Luiza Batista',
	'Davi Ribeiro',
] as const;

export const referenceAreas = {
	ART: 'Artes',
	INF: 'Informática',
	HUM: 'Ciências Humanas',
	LET: 'Linguagens',
	MAT: 'Matemática',
} as const;
