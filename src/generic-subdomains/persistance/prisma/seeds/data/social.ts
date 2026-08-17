/* eslint-disable max-lines -- Curated social fixtures are intentionally reviewable in one file. */
import type {
	CollectionSeed,
	CommentSeed,
	DedicationSeed,
	FriendRequestSeed,
	FriendshipSeed,
	NotificationSeed,
	PoemLikeSeed,
	SavedPoemSeed,
} from './types';

export const friendshipSeeds = [
	{
		userA: 'marina.costa',
		userB: 'joao.miranda',
		createdAt: '2026-05-02T09:00:00.000Z',
	},
	{
		userA: 'marina.costa',
		userB: 'clara.valente',
		createdAt: '2026-05-03T10:10:00.000Z',
	},
	{
		userA: 'marina.costa',
		userB: 'bia.amaral',
		createdAt: '2026-05-06T18:20:00.000Z',
	},
	{
		userA: 'marina.costa',
		userB: 'nina.ferreira',
		createdAt: '2026-05-14T11:40:00.000Z',
	},
	{
		userA: 'joao.miranda',
		userB: 'rafael.nunes',
		createdAt: '2026-05-04T22:15:00.000Z',
	},
	{
		userA: 'joao.miranda',
		userB: 'otavio.reis',
		createdAt: '2026-05-16T12:00:00.000Z',
	},
	{
		userA: 'clara.valente',
		userB: 'luiza.rocha',
		createdAt: '2026-05-12T08:30:00.000Z',
	},
	{
		userA: 'rafael.nunes',
		userB: 'henrique.lima',
		createdAt: '2026-05-18T21:45:00.000Z',
	},
	{
		userA: 'bia.amaral',
		userB: 'nina.ferreira',
		createdAt: '2026-05-19T17:25:00.000Z',
	},
	{
		userA: 'henrique.lima',
		userB: 'caio.almeida',
		createdAt: '2026-05-24T07:20:00.000Z',
	},
	{
		userA: 'luiza.rocha',
		userB: 'nina.ferreira',
		createdAt: '2026-05-26T10:35:00.000Z',
	},
	{
		userA: 'otavio.reis',
		userB: 'caio.almeida',
		createdAt: '2026-05-30T15:05:00.000Z',
	},
] satisfies FriendshipSeed[];

export const friendRequestSeeds = [
	{
		requester: 'caio.almeida',
		addressee: 'marina.costa',
		createdAt: '2026-06-08T09:15:00.000Z',
	},
	{
		requester: 'nina.ferreira',
		addressee: 'joao.miranda',
		createdAt: '2026-06-09T19:40:00.000Z',
	},
	{
		requester: 'clara.valente',
		addressee: 'otavio.reis',
		createdAt: '2026-06-11T13:05:00.000Z',
	},
	{
		requester: 'bia.amaral',
		addressee: 'henrique.lima',
		createdAt: '2026-06-12T16:45:00.000Z',
	},
	{
		requester: 'otavio.reis',
		addressee: 'luiza.rocha',
		createdAt: '2026-06-15T20:30:00.000Z',
	},
] satisfies FriendRequestSeed[];

export const commentSeeds = [
	{
		key: 'cidade-joao',
		poemKey: 'cidade-acende-devagar',
		authorNickname: 'joao.miranda',
		content:
			'Essa imagem das panelas cantando ficou muito viva. Parece fim de tarde mesmo.',
		createdAt: '2026-05-02T08:25:00.000Z',
		likesFrom: ['marina.costa', 'clara.valente'],
	},
	{
		key: 'cidade-nina',
		poemKey: 'cidade-acende-devagar',
		authorNickname: 'nina.ferreira',
		content:
			'Gostei da cidade como alguém que lembra o próprio nome. Bonito e simples.',
		createdAt: '2026-05-02T10:05:00.000Z',
		likesFrom: ['joao.miranda'],
	},
	{
		key: 'bilhete-clara',
		poemKey: 'bilhete-no-guarda-chuva',
		authorNickname: 'clara.valente',
		content:
			'Tem uma delicadeza muito real aqui. Dá para sentir o papel molhado.',
		createdAt: '2026-05-08T07:10:00.000Z',
		likesFrom: ['marina.costa'],
	},
	{
		key: 'oficina-henrique',
		poemKey: 'oficina-de-domingo',
		authorNickname: 'henrique.lima',
		content: 'Como mecânico, eu assino embaixo: graxa também guarda afeto.',
		createdAt: '2026-05-02T15:30:00.000Z',
		likesFrom: ['joao.miranda', 'caio.almeida'],
	},
	{
		key: 'oficina-marina',
		poemKey: 'oficina-de-domingo',
		authorNickname: 'marina.costa',
		content: 'A comparação do motor com uma carta é muito certeira.',
		createdAt: '2026-05-03T09:50:00.000Z',
		likesFrom: ['clara.valente'],
	},
	{
		key: 'mapa-otavio',
		poemKey: 'mapa-dos-retornos',
		authorNickname: 'otavio.reis',
		content:
			'Esse tipo de rua secreta existe mesmo. O corpo sabe antes do mapa.',
		createdAt: '2026-05-10T16:20:00.000Z',
		likesFrom: ['joao.miranda'],
	},
	{
		key: 'lencois-bia',
		poemKey: 'lencois-no-varal',
		authorNickname: 'bia.amaral',
		content: 'Domingo ficou inteiro nesses lençóis. Que poema claro.',
		createdAt: '2026-05-03T14:30:00.000Z',
		likesFrom: ['clara.valente', 'luiza.rocha'],
	},
	{
		key: 'inventario-luiza',
		poemKey: 'inventario-da-cozinha',
		authorNickname: 'luiza.rocha',
		content:
			'A cozinha como lugar de cuidado apareceu sem exagero. Gostei muito.',
		createdAt: '2026-05-12T08:00:00.000Z',
		likesFrom: ['clara.valente', 'bia.amaral'],
	},
	{
		key: 'turno-marina',
		poemKey: 'turno-da-madrugada',
		authorNickname: 'marina.costa',
		content: 'Falar baixo com a esperança é uma imagem linda e triste.',
		createdAt: '2026-05-04T12:15:00.000Z',
		likesFrom: ['rafael.nunes', 'nina.ferreira'],
	},
	{
		key: 'turno-joao',
		poemKey: 'turno-da-madrugada',
		authorNickname: 'joao.miranda',
		content: 'Tem uma humanidade muito forte nesse corredor branco.',
		createdAt: '2026-05-04T18:45:00.000Z',
		likesFrom: ['rafael.nunes'],
	},
	{
		key: 'sala-henrique',
		poemKey: 'sala-de-espera',
		authorNickname: 'henrique.lima',
		content: 'Os relógios fingindo que a demora é deles: perfeito.',
		createdAt: '2026-05-13T12:35:00.000Z',
		likesFrom: ['rafael.nunes'],
	},
	{
		key: 'quintal-nina',
		poemKey: 'domingo-no-quintal',
		authorNickname: 'nina.ferreira',
		content: 'O cheiro do feijão segurou o poema inteiro. Muito bonito.',
		createdAt: '2026-05-05T18:10:00.000Z',
		likesFrom: ['bia.amaral', 'marina.costa'],
	},
	{
		key: 'avo-caio',
		poemKey: 'conversa-com-minha-avo',
		authorNickname: 'caio.almeida',
		content: 'Esse final da colher diz tudo. Me pegou desprevenido.',
		createdAt: '2026-05-16T06:50:00.000Z',
		likesFrom: ['bia.amaral'],
	},
	{
		key: 'terminal-luiza',
		poemKey: 'terminal-rodoviario',
		authorNickname: 'luiza.rocha',
		content: 'Gosto muito da coragem chegando na plataforma. Dá cena.',
		createdAt: '2026-05-06T14:55:00.000Z',
		likesFrom: ['henrique.lima'],
	},
	{
		key: 'caderno-otavio',
		poemKey: 'caderno-de-capa-azul',
		authorNickname: 'otavio.reis',
		content: 'Essa volta ao mesmo nome tem um silêncio enorme.',
		createdAt: '2026-05-17T13:25:00.000Z',
		likesFrom: ['henrique.lima', 'caio.almeida'],
	},
	{
		key: 'trem-rafael',
		poemKey: 'carta-para-um-trem',
		authorNickname: 'rafael.nunes',
		content: 'Nunca pensei no cansaço dos trilhos. Imagem excelente.',
		createdAt: '2026-05-24T08:45:00.000Z',
		likesFrom: ['henrique.lima'],
	},
	{
		key: 'mare-bia',
		poemKey: 'mare-baixa',
		authorNickname: 'bia.amaral',
		content:
			'O mar mostrando os bolsos é uma das melhores imagens que li aqui.',
		createdAt: '2026-05-08T11:40:00.000Z',
		likesFrom: ['luiza.rocha', 'nina.ferreira'],
	},
	{
		key: 'manjericao-clara',
		poemKey: 'vasos-de-manjericao',
		authorNickname: 'clara.valente',
		content:
			'Cuidado tem cheiro, sim. Fiquei com vontade de regar minhas plantas.',
		createdAt: '2026-05-18T21:10:00.000Z',
		likesFrom: ['luiza.rocha'],
	},
	{
		key: 'relogio-joao',
		poemKey: 'relogio-sem-pressa',
		authorNickname: 'joao.miranda',
		content: 'Esse relógio atrasado merecia mesmo virar poema.',
		createdAt: '2026-05-10T19:35:00.000Z',
		likesFrom: ['otavio.reis'],
	},
	{
		key: 'elevador-caio',
		poemKey: 'elevador-para-no-sexto',
		authorNickname: 'caio.almeida',
		content:
			'Prédios com memória: agora vou pensar nisso toda vez que entrar num elevador.',
		createdAt: '2026-05-23T09:25:00.000Z',
		likesFrom: ['otavio.reis'],
	},
	{
		key: 'fevereiro-marina',
		poemKey: 'fevereiro-na-janela',
		authorNickname: 'marina.costa',
		content: 'A luz desse poema é muito boa. Fevereiro ficou palpável.',
		createdAt: '2026-05-12T20:00:00.000Z',
		likesFrom: ['nina.ferreira'],
	},
	{
		key: 'atlas-bia',
		poemKey: 'atlas-da-saudade',
		authorNickname: 'bia.amaral',
		content: 'A padaria no centro me trouxe um lugar inteiro de volta.',
		createdAt: '2026-05-27T08:10:00.000Z',
		likesFrom: ['nina.ferreira', 'marina.costa'],
	},
	{
		key: 'feira-otavio',
		poemKey: 'rua-depois-da-feira',
		authorNickname: 'otavio.reis',
		content:
			'Laranja ferida é uma expressão muito precisa para esse fim de feira.',
		createdAt: '2026-05-14T18:20:00.000Z',
		likesFrom: ['caio.almeida'],
	},
	{
		key: 'recomeco-luiza',
		poemKey: 'manual-do-recomeco',
		authorNickname: 'luiza.rocha',
		content: 'Esse começo pelo copo lavado é simples e humano. Gostei demais.',
		createdAt: '2026-05-28T10:15:00.000Z',
		likesFrom: ['caio.almeida', 'henrique.lima'],
	},
] satisfies CommentSeed[];

export const poemLikeSeeds = [
	{
		poemKey: 'cidade-acende-devagar',
		userNicknames: [
			'joao.miranda',
			'clara.valente',
			'bia.amaral',
			'nina.ferreira',
		],
	},
	{
		poemKey: 'bilhete-no-guarda-chuva',
		userNicknames: ['clara.valente', 'joao.miranda'],
	},
	{
		poemKey: 'oficina-de-domingo',
		userNicknames: ['marina.costa', 'henrique.lima', 'caio.almeida'],
	},
	{
		poemKey: 'mapa-dos-retornos',
		userNicknames: ['otavio.reis', 'marina.costa'],
	},
	{
		poemKey: 'lencois-no-varal',
		userNicknames: ['bia.amaral', 'luiza.rocha', 'marina.costa'],
	},
	{
		poemKey: 'inventario-da-cozinha',
		userNicknames: ['luiza.rocha', 'bia.amaral', 'nina.ferreira'],
	},
	{
		poemKey: 'turno-da-madrugada',
		userNicknames: ['marina.costa', 'joao.miranda', 'nina.ferreira'],
	},
	{
		poemKey: 'sala-de-espera',
		userNicknames: ['joao.miranda', 'henrique.lima'],
	},
	{
		poemKey: 'domingo-no-quintal',
		userNicknames: ['marina.costa', 'nina.ferreira', 'caio.almeida'],
	},
	{
		poemKey: 'conversa-com-minha-avo',
		userNicknames: ['caio.almeida', 'clara.valente', 'marina.costa'],
	},
	{
		poemKey: 'terminal-rodoviario',
		userNicknames: ['luiza.rocha', 'rafael.nunes'],
	},
	{
		poemKey: 'caderno-de-capa-azul',
		userNicknames: ['otavio.reis', 'caio.almeida', 'joao.miranda'],
	},
	{
		poemKey: 'carta-para-um-trem',
		userNicknames: ['rafael.nunes', 'otavio.reis'],
	},
	{
		poemKey: 'mare-baixa',
		userNicknames: ['bia.amaral', 'nina.ferreira', 'clara.valente'],
	},
	{
		poemKey: 'vasos-de-manjericao',
		userNicknames: ['clara.valente', 'marina.costa'],
	},
	{
		poemKey: 'relogio-sem-pressa',
		userNicknames: ['joao.miranda', 'nina.ferreira', 'caio.almeida'],
	},
	{
		poemKey: 'elevador-para-no-sexto',
		userNicknames: ['caio.almeida', 'marina.costa'],
	},
	{
		poemKey: 'fevereiro-na-janela',
		userNicknames: ['marina.costa', 'bia.amaral', 'luiza.rocha'],
	},
	{
		poemKey: 'atlas-da-saudade',
		userNicknames: ['bia.amaral', 'marina.costa'],
	},
	{
		poemKey: 'rua-depois-da-feira',
		userNicknames: ['otavio.reis', 'henrique.lima', 'nina.ferreira'],
	},
	{
		poemKey: 'manual-do-recomeco',
		userNicknames: ['luiza.rocha', 'henrique.lima', 'clara.valente'],
	},
] satisfies PoemLikeSeed[];

export const savedPoemSeeds = [
	{
		userNickname: 'marina.costa',
		poemKey: 'oficina-de-domingo',
		createdAt: '2026-05-03T10:20:00.000Z',
	},
	{
		userNickname: 'marina.costa',
		poemKey: 'atlas-da-saudade',
		createdAt: '2026-05-28T12:10:00.000Z',
	},
	{
		userNickname: 'joao.miranda',
		poemKey: 'cidade-acende-devagar',
		createdAt: '2026-05-02T09:30:00.000Z',
	},
	{
		userNickname: 'clara.valente',
		poemKey: 'manual-do-recomeco',
		createdAt: '2026-05-29T07:15:00.000Z',
	},
	{
		userNickname: 'bia.amaral',
		poemKey: 'mare-baixa',
		createdAt: '2026-05-09T08:05:00.000Z',
	},
	{
		userNickname: 'henrique.lima',
		poemKey: 'turno-da-madrugada',
		createdAt: '2026-05-05T11:40:00.000Z',
	},
	{
		userNickname: 'luiza.rocha',
		poemKey: 'inventario-da-cozinha',
		createdAt: '2026-05-12T19:20:00.000Z',
	},
	{
		userNickname: 'otavio.reis',
		poemKey: 'caderno-de-capa-azul',
		createdAt: '2026-05-18T13:00:00.000Z',
	},
	{
		userNickname: 'nina.ferreira',
		poemKey: 'lencois-no-varal',
		createdAt: '2026-05-04T10:50:00.000Z',
	},
	{
		userNickname: 'caio.almeida',
		poemKey: 'terminal-rodoviario',
		createdAt: '2026-05-07T06:30:00.000Z',
	},
] satisfies SavedPoemSeed[];

export const collectionSeeds = [
	{
		ownerNickname: 'marina.costa',
		name: 'Para reler à noite',
		description: 'Poemas com silêncio, cidade e um pouco de luz acesa.',
		poemKeys: ['relogio-sem-pressa', 'atlas-da-saudade', 'turno-da-madrugada'],
	},
	{
		ownerNickname: 'clara.valente',
		name: 'Casa e cozinha',
		description: 'Textos que lembram mesa posta, quintal e gente perto.',
		poemKeys: [
			'inventario-da-cozinha',
			'domingo-no-quintal',
			'conversa-com-minha-avo',
		],
	},
	{
		ownerNickname: 'caio.almeida',
		name: 'Recomeços',
		description: 'Poemas para voltar devagar.',
		poemKeys: [
			'manual-do-recomeco',
			'caderno-de-capa-azul',
			'mapa-dos-retornos',
		],
	},
] satisfies CollectionSeed[];

export const dedicationSeeds = [
	{
		poemKey: 'bilhete-no-guarda-chuva',
		toUserNickname: 'clara.valente',
		createdAt: '2026-05-07T18:26:00.000Z',
	},
	{
		poemKey: 'carta-para-um-trem',
		toUserNickname: 'rafael.nunes',
		createdAt: '2026-05-23T18:11:00.000Z',
	},
	{
		poemKey: 'manual-do-recomeco',
		toUserNickname: 'henrique.lima',
		createdAt: '2026-05-28T06:31:00.000Z',
	},
] satisfies DedicationSeed[];

export const notificationSeeds = [
	{
		recipientNickname: 'marina.costa',
		type: 'POEM_LIKED',
		actorNickname: 'nina.ferreira',
		entity: { type: 'POEM', poemKey: 'cidade-acende-devagar' },
		data: {
			title: 'Your poem was liked',
			body: 'Your poem received likes from Nina and others',
			poemTitle: 'A cidade acende devagar',
			likerNickname: 'nina.ferreira',
		},
		aggregatedCount: 3,
		createdAt: '2026-06-15T10:25:00.000Z',
	},
	{
		recipientNickname: 'joao.miranda',
		type: 'POEM_COMMENT_CREATED',
		actorNickname: 'henrique.lima',
		entity: { type: 'POEM', poemKey: 'oficina-de-domingo' },
		data: {
			title: 'New comment on your poem',
			body: 'Henrique commented on Oficina de domingo',
			poemTitle: 'Oficina de domingo',
			commenterNickname: 'henrique.lima',
		},
		createdAt: '2026-06-15T11:10:00.000Z',
	},
	{
		recipientNickname: 'clara.valente',
		type: 'POEM_DEDICATED',
		actorNickname: 'marina.costa',
		entity: { type: 'POEM', poemKey: 'bilhete-no-guarda-chuva' },
		data: {
			title: 'A poem was dedicated to you',
			body: 'Marina dedicated Bilhete no guarda-chuva to you',
			poemTitle: 'Bilhete no guarda-chuva',
			dedicatorNickname: 'marina.costa',
		},
		createdAt: '2026-06-14T18:30:00.000Z',
		readAt: '2026-06-15T08:00:00.000Z',
	},
	{
		recipientNickname: 'marina.costa',
		type: 'NEW_FRIEND_REQUEST',
		actorNickname: 'caio.almeida',
		entity: { type: 'USER', userNickname: 'caio.almeida' },
		data: {
			title: 'New friend request',
			body: 'Caio sent you a friend request',
			requesterNickname: 'caio.almeida',
		},
		createdAt: '2026-06-13T09:00:00.000Z',
	},
	{
		recipientNickname: 'otavio.reis',
		type: 'POEM_LIKED',
		actorNickname: 'caio.almeida',
		entity: { type: 'POEM', poemKey: 'elevador-para-no-sexto' },
		data: {
			title: 'Your poem was liked',
			body: 'Caio liked O elevador para no sexto',
			poemTitle: 'O elevador para no sexto',
			likerNickname: 'caio.almeida',
		},
		createdAt: '2026-06-12T15:35:00.000Z',
	},
	{
		recipientNickname: 'rafael.nunes',
		type: 'POEM_DEDICATED',
		actorNickname: 'henrique.lima',
		entity: { type: 'POEM', poemKey: 'carta-para-um-trem' },
		data: {
			title: 'A poem was dedicated to you',
			body: 'Henrique dedicated Carta para um trem to you',
			poemTitle: 'Carta para um trem',
			dedicatorNickname: 'henrique.lima',
		},
		createdAt: '2026-06-11T20:15:00.000Z',
	},
] satisfies NotificationSeed[];
