export const permissions = [
	{
		title: 'Contas e equipe',
		description:
			'Criar professores, funcionários e administradores; corrigir identificação e vínculos profissionais.',
		roles: ['admin'],
	},
	{
		title: 'Papéis e acesso',
		description:
			'Alterar o papel, suspender, bloquear ou reativar contas, respeitando vínculos e a existência de um administrador ativo.',
		roles: ['admin'],
	},
	{
		title: 'Cadastro de alunos',
		description: 'Cadastrar alunos e emitir o registro para o primeiro acesso.',
		roles: ['admin', 'staff'],
	},
	{
		title: 'Gestão acadêmica',
		description:
			'Organizar turmas, matrículas, vínculos docentes e calendário institucional.',
		roles: ['admin', 'staff'],
	},
	{
		title: 'Espaço docente',
		description:
			'Planejar aulas e atividades e acompanhar alunos das turmas vinculadas ao professor.',
		roles: ['professor'],
	},
	{
		title: 'Espaço do aluno',
		description:
			'Consultar os próprios dados acadêmicos, acessar materiais e entregar atividades.',
		roles: ['student'],
	},
];
