/* eslint-disable max-lines -- Curated poem fixtures are intentionally reviewable in one file. */
import type { SeedPoem } from './types';

export const poemSeeds = [
	{
		key: 'cidade-acende-devagar',
		authorNickname: 'marina.costa',
		title: 'A cidade acende devagar',
		content: `A cidade acende devagar
como quem lembra o próprio nome.
Nas janelas, mãos recolhem toalhas,
panelas cantam sem plateia
e a noite aprende a caber na rua.`,
		tags: ['cidade', 'cotidiano', 'noite'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'approved',
		createdAt: '2026-05-01T21:10:00.000Z',
	},
	{
		key: 'bilhete-no-guarda-chuva',
		authorNickname: 'marina.costa',
		title: 'Bilhete no guarda-chuva',
		content: `Guardei teu bilhete
no bolso do guarda-chuva quebrado.
Choveu dentro da bolsa,
mas a tua letra ficou inteira,
teimosa como uma promessa pequena.`,
		tags: ['chuva', 'memória', 'amor'],
		status: 'published',
		visibility: 'friends',
		moderationStatus: 'approved',
		createdAt: '2026-05-07T18:25:00.000Z',
	},
	{
		key: 'rascunho-antes-da-chuva',
		authorNickname: 'marina.costa',
		title: 'Rascunho para antes da chuva',
		content: `Ainda não sei dizer
se o céu pesa ou consola.
Anoto a primeira gota
e deixo o resto em silêncio,
como quem espera a palavra certa.`,
		tags: ['rascunho', 'chuva', 'silêncio'],
		status: 'draft',
		visibility: 'private',
		moderationStatus: 'approved',
		createdAt: '2026-05-20T17:50:00.000Z',
	},
	{
		key: 'oficina-de-domingo',
		authorNickname: 'joao.miranda',
		title: 'Oficina de domingo',
		content: `Meu pai abria o motor
como quem abria uma carta.
Eu segurava parafusos,
ele procurava defeitos
e a manhã cheirava a graxa e paciência.`,
		tags: ['família', 'memória', 'trabalho'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'approved',
		createdAt: '2026-05-02T12:05:00.000Z',
	},
	{
		key: 'mapa-dos-retornos',
		authorNickname: 'joao.miranda',
		title: 'Mapa dos retornos',
		content: `Toda volta tem uma rua secreta.
Não aparece no aplicativo,
não cabe no nome do bairro,
mas o corpo reconhece
quando a esquina enfim perdoa.`,
		tags: ['viagem', 'cidade', 'retorno'],
		status: 'published',
		visibility: 'unlisted',
		moderationStatus: 'approved',
		createdAt: '2026-05-09T09:15:00.000Z',
	},
	{
		key: 'semaforo-em-silencio',
		authorNickname: 'joao.miranda',
		title: 'Semáforo em silêncio',
		content: `O semáforo piscava amarelo
para uma avenida sem carros.
Fiquei ali, obediente,
esperando autorização
para atravessar uma ausência.`,
		tags: ['cidade', 'espera', 'ausência'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'pending',
		createdAt: '2026-06-10T22:40:00.000Z',
	},
	{
		key: 'lencois-no-varal',
		authorNickname: 'clara.valente',
		title: 'Lençóis no varal',
		content: `Os lençóis no varal
batem palmas para o vento.
A casa respira sabão,
domingo e luz aberta,
como se nada doesse lá fora.`,
		tags: ['casa', 'domingo', 'vento'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'approved',
		createdAt: '2026-05-03T11:45:00.000Z',
	},
	{
		key: 'inventario-da-cozinha',
		authorNickname: 'clara.valente',
		title: 'Inventário da cozinha',
		content: `Duas xícaras lascadas,
um pano com cheiro de alho,
três risadas guardadas na mesa.
Tudo que chamamos de casa
começa querendo alimentar alguém.`,
		tags: ['casa', 'comida', 'afeto'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'approved',
		createdAt: '2026-05-11T20:00:00.000Z',
	},
	{
		key: 'carta-sem-envelope',
		authorNickname: 'clara.valente',
		title: 'Uma carta sem envelope',
		content: `Escrevi teu nome
na beira de uma notícia ruim.
Não era pedido nem despedida,
era só a tentativa antiga
de manter alguma coisa perto.`,
		tags: ['carta', 'saudade', 'memória'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'rejected',
		rejectionReason:
			'O poema precisa de revisão antes de voltar para a publicação.',
		createdAt: '2026-06-05T15:35:00.000Z',
	},
	{
		key: 'turno-da-madrugada',
		authorNickname: 'rafael.nunes',
		title: 'Turno da madrugada',
		content: `No corredor branco
o café esfria antes da notícia.
Cada porta tem um mundo
segurando a respiração,
e eu aprendo a falar baixo com a esperança.`,
		tags: ['hospital', 'madrugada', 'esperança'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'approved',
		createdAt: '2026-05-04T03:20:00.000Z',
	},
	{
		key: 'sala-de-espera',
		authorNickname: 'rafael.nunes',
		title: 'Sala de espera',
		content: `Na sala de espera
ninguém sabe onde colocar as mãos.
Revistas antigas envelhecem de novo
enquanto os relógios fingem
que a demora é só deles.`,
		tags: ['espera', 'hospital', 'tempo'],
		status: 'published',
		visibility: 'friends',
		moderationStatus: 'approved',
		createdAt: '2026-05-13T06:45:00.000Z',
	},
	{
		key: 'pagina-arrancada',
		authorNickname: 'rafael.nunes',
		title: 'Página arrancada',
		content: `Arranquei a página
e ela continuou fazendo barulho.
Há coisas que saem do caderno
mas ficam nos dedos,
difíceis de lavar.`,
		tags: ['perda', 'caderno', 'silêncio'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'removed',
		isCommentable: false,
		createdAt: '2026-05-24T23:30:00.000Z',
	},
	{
		key: 'domingo-no-quintal',
		authorNickname: 'bia.amaral',
		title: 'Domingo no quintal',
		content: `Minha mãe lava alface
como quem benze a tarde.
No quintal, um rádio antigo
mistura jogo, panela e passarinho,
e a família cabe inteira no cheiro do feijão.`,
		tags: ['família', 'quintal', 'domingo'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'approved',
		createdAt: '2026-05-05T13:30:00.000Z',
	},
	{
		key: 'conversa-com-minha-avo',
		authorNickname: 'bia.amaral',
		title: 'Conversa com minha avó',
		content: `Minha avó pergunta se eu comi,
mas quer saber se estou inteira.
Respondo que sim,
e ela entende a mentira
pelo jeito como mexo a colher.`,
		tags: ['avó', 'família', 'cuidado'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'approved',
		createdAt: '2026-05-15T19:05:00.000Z',
	},
	{
		key: 'coisa-pequena',
		authorNickname: 'bia.amaral',
		title: 'Coisa pequena',
		content: `Uma formiga carrega
metade de uma pétala.
Penso no peso dos dias
e no quanto ainda seguimos
por caminhos que ninguém desenhou.`,
		tags: ['natureza', 'delicadeza', 'força'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'pending',
		createdAt: '2026-06-12T10:10:00.000Z',
	},
	{
		key: 'terminal-rodoviario',
		authorNickname: 'henrique.lima',
		title: 'Terminal rodoviário',
		content: `No terminal rodoviário
todo abraço parece carregar mala.
Há quem parta leve,
há quem sente na plataforma
só para ver se a coragem chega.`,
		tags: ['viagem', 'despedida', 'coragem'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'approved',
		createdAt: '2026-05-06T08:40:00.000Z',
	},
	{
		key: 'caderno-de-capa-azul',
		authorNickname: 'henrique.lima',
		title: 'Caderno de capa azul',
		content: `Comprei um caderno azul
para escrever coisas novas.
Na primeira página,
sem perceber,
voltei ao mesmo nome.`,
		tags: ['caderno', 'recomeço', 'memória'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'approved',
		createdAt: '2026-05-17T07:25:00.000Z',
	},
	{
		key: 'carta-para-um-trem',
		authorNickname: 'henrique.lima',
		title: 'Carta para um trem',
		content: `Se um trem pudesse responder,
talvez dissesse que partir
também cansa os trilhos.
Eu ficaria na estação,
aprendendo a ouvir ferro e distância.`,
		tags: ['trem', 'distância', 'carta'],
		status: 'published',
		visibility: 'friends',
		moderationStatus: 'approved',
		createdAt: '2026-05-23T18:10:00.000Z',
	},
	{
		key: 'mare-baixa',
		authorNickname: 'luiza.rocha',
		title: 'Maré baixa',
		content: `Na maré baixa
o mar mostra os bolsos.
Conchas, algas, garrafas,
pequenos esquecimentos
que a água não quis levar sozinha.`,
		tags: ['mar', 'natureza', 'memória'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'approved',
		createdAt: '2026-05-08T05:55:00.000Z',
	},
	{
		key: 'vasos-de-manjericao',
		authorNickname: 'luiza.rocha',
		title: 'Entre vasos de manjericão',
		content: `Plantei manjericão
para lembrar que cuidado tem cheiro.
A varanda ficou pequena,
mas o vento passou diferente,
como se pedisse licença.`,
		tags: ['plantas', 'cuidado', 'varanda'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'approved',
		createdAt: '2026-05-18T16:15:00.000Z',
	},
	{
		key: 'primeira-versao-de-maio',
		authorNickname: 'luiza.rocha',
		title: 'Primeira versão de maio',
		content: `Maio começou com uma lista
de coisas que eu não disse.
Dobrei o papel em quatro,
guardei no livro de receitas
e fiz arroz como quem pede desculpas.`,
		tags: ['rascunho', 'maio', 'casa'],
		status: 'draft',
		visibility: 'private',
		moderationStatus: 'approved',
		createdAt: '2026-05-21T12:20:00.000Z',
	},
	{
		key: 'relogio-sem-pressa',
		authorNickname: 'otavio.reis',
		title: 'Relógio sem pressa',
		content: `O relógio da biblioteca
atrasa doze minutos por dia.
Ninguém reclama.
Talvez todo leitor saiba
que certas horas precisam ficar mais tempo.`,
		tags: ['biblioteca', 'tempo', 'leitura'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'approved',
		createdAt: '2026-05-10T14:35:00.000Z',
	},
	{
		key: 'elevador-para-no-sexto',
		authorNickname: 'otavio.reis',
		title: 'O elevador para no sexto',
		content: `O elevador para no sexto
mesmo quando ninguém aperta.
Entro sozinho,
saio lembrando
que prédios também têm memória.`,
		tags: ['prédio', 'memória', 'cidade'],
		status: 'published',
		visibility: 'unlisted',
		moderationStatus: 'approved',
		createdAt: '2026-05-22T21:00:00.000Z',
	},
	{
		key: 'recado-para-a-noite',
		authorNickname: 'otavio.reis',
		title: 'Recado para a noite',
		content: `Noite,
não apague tudo de uma vez.
Deixe uma fresta
para quem chega tarde
e ainda procura a chave.`,
		tags: ['noite', 'casa', 'espera'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'pending',
		createdAt: '2026-06-13T01:10:00.000Z',
	},
	{
		key: 'fevereiro-na-janela',
		authorNickname: 'nina.ferreira',
		title: 'Fevereiro na janela',
		content: `Fevereiro encosta na janela
com cheiro de roupa seca.
Há um calor antigo
sentado no parapeito,
esperando alguém abrir conversa.`,
		tags: ['verão', 'janela', 'cotidiano'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'approved',
		createdAt: '2026-05-12T17:45:00.000Z',
	},
	{
		key: 'atlas-da-saudade',
		authorNickname: 'nina.ferreira',
		title: 'Pequeno atlas da saudade',
		content: `A saudade tem mapas imprecisos.
Uma padaria no centro,
um perfume no ônibus,
o barulho da chave
abrindo uma casa que já mudou de dono.`,
		tags: ['saudade', 'cidade', 'memória'],
		status: 'published',
		visibility: 'friends',
		moderationStatus: 'approved',
		createdAt: '2026-05-26T20:30:00.000Z',
	},
	{
		key: 'nome-das-coisas-simples',
		authorNickname: 'nina.ferreira',
		title: 'O nome das coisas simples',
		content: `Queria saber o nome
da luz que sobra no copo.
Da pausa antes do riso.
Da vontade de ficar
quando ninguém pede.`,
		tags: ['delicadeza', 'luz', 'cotidiano'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'pending',
		createdAt: '2026-06-14T09:05:00.000Z',
	},
	{
		key: 'rua-depois-da-feira',
		authorNickname: 'caio.almeida',
		title: 'Rua depois da feira',
		content: `Depois da feira
a rua cheira a laranja ferida.
Um homem varre folhas de alface,
duas crianças dividem pastel
e o sábado vai embora aos poucos.`,
		tags: ['feira', 'rua', 'sábado'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'approved',
		createdAt: '2026-05-14T12:10:00.000Z',
	},
	{
		key: 'manual-do-recomeco',
		authorNickname: 'caio.almeida',
		title: 'Manual do recomeço',
		content: `Primeiro, lave o copo.
Depois, abra a janela.
Não chame de coragem
o que ainda é só cansaço
aprendendo a levantar.`,
		tags: ['recomeço', 'casa', 'coragem'],
		status: 'published',
		visibility: 'public',
		moderationStatus: 'approved',
		createdAt: '2026-05-28T06:30:00.000Z',
	},
	{
		key: 'rascunho-para-clara',
		authorNickname: 'caio.almeida',
		title: 'Rascunho para Clara',
		content: `Clara,
hoje a manhã chegou sem pressa.
Deixei teu nome no rodapé,
não por falta de assunto,
mas porque algumas pessoas encerram melhor o dia.`,
		tags: ['rascunho', 'carta', 'manhã'],
		status: 'draft',
		visibility: 'private',
		moderationStatus: 'approved',
		createdAt: '2026-06-01T07:05:00.000Z',
	},
] satisfies SeedPoem[];
