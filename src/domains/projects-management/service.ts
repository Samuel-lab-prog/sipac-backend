import { randomUUID } from 'node:crypto';
import { prisma } from '@Prisma';

/* eslint-disable max-lines -- project catalog and workflow policies share one transaction boundary. */
import type { Prisma } from '@PrismaGenerated/client';
import {
	ConflictError,
	ForbiddenError,
	NotFoundError,
	UnprocessableEntityError,
} from '@DomainError';
import {
	activeAccount,
	requireManager,
	type Actor,
} from '../institution-management/access';
import type {
	ProjectBody,
	ParticipantBody,
	TransitionBody,
	ProjectListQuery,
} from './schemas';
import { validateDates, validateTransition } from './policies';
type Account = Awaited<ReturnType<typeof activeAccount>>;
const manager = (u: Account) => ['admin', 'staff'].includes(u.role);
const person = { id: true, name: true } as const;
const include = {
	coordinator: { select: person },
	department: { select: { id: true, name: true, code: true } },
	_count: { select: { participants: true, reports: true } },
} as const;
function visibility(
	user: Account,
	scope: ProjectListQuery['scope'] = 'campus',
	ownership?: ProjectListQuery['ownership'],
): Prisma.InstitutionalProjectWhereInput {
	if (scope === 'institution' && !manager(user))
		throw new ForbiddenError(
			'A consulta institucional pertence à gestão acadêmica.',
		);
	const campusScope =
		scope === 'institution'
			? { campus: { institutionId: user.campus.institution.id } }
			: { campusId: user.campusId };
	const effectiveOwnership = ownership ?? (manager(user) ? 'all' : 'mine');
	if (effectiveOwnership === 'all' && !manager(user))
		return {
			...campusScope,
			status: { in: ['submitted', 'active', 'completed'] },
		};
	return {
		...campusScope,
		...(effectiveOwnership === 'mine'
			? {
					OR: [
						{ coordinatorId: user.id },
						{ participants: { some: { userId: user.id } } },
					],
				}
			: {}),
	};
}
async function filteredWhere(actor: Actor, query: ProjectListQuery) {
	const user = await activeAccount(actor);
	const researcher = query.researcher?.trim();
	const filters: Prisma.InstitutionalProjectWhereInput[] = [
		visibility(user, query.scope, query.ownership),
	];
	if (researcher)
		filters.push({
			OR: [
				{
					coordinator: {
						name: { contains: researcher, mode: 'insensitive' },
					},
				},
				{
					participants: {
						some: {
							user: {
								name: { contains: researcher, mode: 'insensitive' },
							},
						},
					},
				},
			],
		});
	if (query.q?.trim())
		filters.push({
			OR: [
				{
					title: { contains: query.q.trim(), mode: 'insensitive' },
				},
				{
					objectives: { contains: query.q.trim(), mode: 'insensitive' },
				},
				{ code: { contains: query.q.trim(), mode: 'insensitive' } },
			],
		});
	for (const [field, value] of [
		['researchLine', query.researchLine],
		['knowledgeArea', query.knowledgeArea],
		['researchGroup', query.researchGroup],
		['fundingAgency', query.fundingAgency],
		['callName', query.callName],
		['nature', query.nature],
		['researchType', query.researchType],
	] as const) {
		if (value?.trim())
			filters.push({
				[field]: { contains: value.trim(), mode: 'insensitive' },
			});
	}
	const where = {
		AND: filters,
		kind: query.kind,
		origin: query.origin,
		status: query.status,
		finalReportStatus: query.finalReport,
		departmentId: query.departmentId,
		year: query.year,
		...(query.code?.trim()
			? { code: { contains: query.code.trim(), mode: 'insensitive' as const } }
			: {}),
	};
	return { user, where };
}
export async function list(actor: Actor, query: ProjectListQuery) {
	const { where } = await filteredWhere(actor, query),
		page = query.page ?? 1;
	const [items, total] = await prisma.$transaction([
		prisma.institutionalProject.findMany({
			where,
			include,
			orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
			take: 20,
			skip: (page - 1) * 20,
		}),
		prisma.institutionalProject.count({ where }),
	]);
	return { items, total, page, pageSize: 20 };
}
export async function report(actor: Actor, query: ProjectListQuery) {
	const { user, where } = await filteredWhere(actor, query);
	requireManager(user);
	const projects = await prisma.institutionalProject.findMany({
		where,
		include: {
			coordinator: { select: { name: true } },
			department: { select: { name: true } },
		},
		orderBy: [{ year: 'desc' }, { code: 'asc' }],
		take: 5000,
	});
	const escape = (value: string | number | null | undefined) =>
		`"${String(value ?? '').replaceAll('"', '""')}"`;
	return [
		[
			'Código',
			'Ano',
			'Tipo',
			'Origem',
			'Situação',
			'Relatório final',
			'Unidade',
			'Coordenador',
			'Título',
			'Objetivos',
		]
			.map(escape)
			.join(','),
		...projects.map((project) =>
			[
				project.code,
				project.year,
				project.kind,
				project.origin,
				project.status,
				project.finalReportStatus,
				project.department?.name,
				project.coordinator.name,
				project.title,
				project.objectives,
			]
				.map(escape)
				.join(','),
		),
	].join('\n');
}
export async function departments(
	actor: Actor,
	scope: ProjectListQuery['scope'] = 'campus',
) {
	const user = await activeAccount(actor);
	if (scope === 'institution' && !manager(user))
		throw new ForbiddenError(
			'A consulta institucional pertence à gestão acadêmica.',
		);
	return prisma.department.findMany({
		where:
			scope === 'institution'
				? { campus: { institutionId: user.campus.institution.id } }
				: { campusId: user.campusId },
		select: { id: true, name: true, code: true },
		orderBy: { name: 'asc' },
	});
}
export async function detail(actor: Actor, id: number) {
	const user = await activeAccount(actor);
	const detailVisibility: Prisma.InstitutionalProjectWhereInput = manager(user)
		? visibility(user)
		: {
				campusId: user.campusId,
				OR: [
					{ coordinatorId: user.id },
					{ participants: { some: { userId: user.id } } },
					{ status: { in: ['submitted', 'active', 'completed'] } },
				],
			};
	const project = await prisma.institutionalProject.findFirst({
		where: { id, ...detailVisibility },
		include: {
			...include,
			participants: {
				include: { user: { select: person } },
				orderBy: { id: 'asc' },
			},
			reports: { orderBy: { createdAt: 'desc' } },
			events: { orderBy: { createdAt: 'desc' } },
		},
	});
	if (!project) throw new NotFoundError('Projeto não encontrado.');
	return project;
}
export async function candidates(actor: Actor, q: string) {
	const user = await activeAccount(actor);
	if (user.role === 'student')
		throw new ForbiddenError('Você não pode consultar candidatos.');
	if (q.trim().length < 2) return [];
	return prisma.user.findMany({
		where: {
			campusId: user.campusId,
			status: 'active',
			deletedAt: null,
			name: { contains: q.trim(), mode: 'insensitive' },
		},
		select: { ...person, role: true },
		orderBy: { name: 'asc' },
		take: 20,
	});
}
export async function create(actor: Actor, body: ProjectBody) {
	const user = await activeAccount(actor);
	if (!['admin', 'staff', 'professor'].includes(user.role))
		throw new ForbiddenError(
			'A criação de projetos é restrita a servidores e docentes.',
		);
	validateDates(new Date(body.startsAt), new Date(body.endsAt));
	if (body.departmentId) {
		const department = await prisma.department.findFirst({
			where: { id: body.departmentId, campusId: user.campusId },
		});
		if (!department)
			throw new UnprocessableEntityError(
				'A unidade informada não pertence ao campus atual.',
			);
	}
	const startsAt = new Date(body.startsAt);
	const year = startsAt.getUTCFullYear();
	return prisma.$transaction(async (tx) => {
		const project = await tx.institutionalProject.create({
			data: {
				code: `PENDING-${randomUUID()}`,
				year,
				origin: body.origin ?? 'internal',
				departmentId: body.departmentId,
				title: body.title.trim(),
				objectives: body.objectives.trim(),
				kind: body.kind,
				researchLine: body.researchLine?.trim(),
				knowledgeArea: body.knowledgeArea?.trim(),
				researchGroup: body.researchGroup?.trim(),
				fundingAgency: body.fundingAgency?.trim(),
				callName: body.callName?.trim(),
				nature: body.nature?.trim(),
				researchType: body.researchType?.trim(),
				startsAt,
				endsAt: new Date(body.endsAt),
				campusId: user.campusId,
				coordinatorId: user.id,
				events: {
					create: {
						actorId: user.id,
						action: 'created',
						note: 'Projeto cadastrado.',
					},
				},
			},
		});
		return tx.institutionalProject.update({
			where: { id: project.id },
			data: {
				code: `P${String(user.campusId).padStart(3, '0')}${String(project.id).padStart(4, '0')}-${year}`,
			},
			include,
		});
	});
}
// Serialize all project writes, so approval cannot race participant or report changes.
async function mutate<T>(
	actor: Actor,
	id: number,
	work: (
		tx: Prisma.TransactionClient,
		user: Account,
		project: Prisma.InstitutionalProjectGetPayload<object>,
	) => Promise<T>,
) {
	const user = await activeAccount(actor);
	return prisma.$transaction(async (tx) => {
		await tx.$executeRaw`SELECT pg_advisory_xact_lock(73120, ${id}::int)`;
		const project = await tx.institutionalProject.findFirst({
			where: { id, ...visibility(user) },
		});
		if (!project) throw new NotFoundError('Projeto não encontrado.');
		const result = await work(tx, user, project);
		await tx.institutionalProject.update({
			where: { id },
			data: { version: { increment: 1 } },
		});
		return result;
	});
}
function canEdit(user: Account, p: { coordinatorId: number; status: string }) {
	if (!manager(user) && p.coordinatorId !== user.id)
		throw new ForbiddenError(
			'Somente a coordenação e a gestão podem editar o projeto.',
		);
	if (['completed', 'cancelled'].includes(p.status))
		throw new ConflictError('O projeto está encerrado.');
}
export function addParticipant(
	actor: Actor,
	id: number,
	body: ParticipantBody,
) {
	return mutate(actor, id, async (tx, user, p) => {
		canEdit(user, p);
		validateDates(new Date(body.startsAt), new Date(body.endsAt), p);
		const candidate = await tx.user.findFirst({
			where: {
				id: body.userId,
				campusId: user.campusId,
				status: 'active',
				deletedAt: null,
			},
		});
		if (!candidate)
			throw new UnprocessableEntityError(
				'Participante indisponível neste campus.',
			);
		if (
			await tx.projectParticipant.count({
				where: { projectId: id, userId: body.userId },
			})
		)
			throw new ConflictError('Esta pessoa já participa do projeto.');
		await tx.projectEvent.create({
			data: {
				projectId: id,
				actorId: user.id,
				action: 'participant_added',
				note: candidate.name,
			},
		});
		return tx.projectParticipant.create({
			data: {
				...body,
				role: body.role.trim(),
				workPlan: body.workPlan.trim(),
				projectId: id,
			},
		});
	});
}
export function addReport(
	actor: Actor,
	id: number,
	body: { title: string; body: string },
) {
	return mutate(actor, id, async (tx, user, p) => {
		if (p.status !== 'active')
			throw new ConflictError('Relatórios são enviados durante a execução.');
		const report = await tx.projectReport.create({
			data: {
				projectId: id,
				authorId: user.id,
				title: body.title.trim(),
				body: body.body.trim(),
			},
		});
		await tx.institutionalProject.update({
			where: { id },
			data: { finalReportStatus: 'submitted' },
		});
		return report;
	});
}
export function approveReport(actor: Actor, id: number, reportId: number) {
	return mutate(actor, id, async (tx, user, p) => {
		requireManager(user);
		canEdit(user, p);
		const report = await tx.projectReport.findFirst({
			where: { id: reportId, projectId: id },
		});
		if (!report) throw new NotFoundError('Relatório não encontrado.');
		if (report.authorId === user.id)
			throw new ForbiddenError(
				'O relatório precisa ser avaliado por outra pessoa da gestão.',
			);
		await tx.projectEvent.create({
			data: {
				projectId: id,
				actorId: user.id,
				action: 'report_approved',
				note: report.title,
			},
		});
		const approvedReport = await tx.projectReport.update({
			where: { id: reportId },
			data: { approved: true, reviewedBy: user.id, reviewedAt: new Date() },
		});
		await tx.institutionalProject.update({
			where: { id },
			data: { finalReportStatus: 'approved' },
		});
		return approvedReport;
	});
}
export function approveHours(
	actor: Actor,
	id: number,
	participantId: number,
	hours: number,
) {
	return mutate(actor, id, async (tx, user, p) => {
		requireManager(user);
		canEdit(user, p);
		if (p.status !== 'active')
			throw new ConflictError('Valide as horas durante a execução.');
		const participant = await tx.projectParticipant.findFirst({
			where: { id: participantId, projectId: id },
		});
		if (!participant) throw new NotFoundError('Participante não encontrado.');
		if (participant.userId === user.id)
			throw new ForbiddenError(
				'Sua carga horária precisa ser validada por outra pessoa da gestão.',
			);
		await tx.projectEvent.create({
			data: {
				projectId: id,
				actorId: user.id,
				action: 'hours_approved',
				note: `Participante ${participantId}: ${hours} horas.`,
			},
		});
		return tx.projectParticipant.update({
			where: { id: participantId },
			data: {
				approvedHours: hours,
				hoursApprovedBy: user.id,
				hoursApprovedAt: new Date(),
			},
		});
	});
}
export function transition(actor: Actor, id: number, body: TransitionBody) {
	return mutate(actor, id, async (tx, user, p) => {
		canEdit(user, p);
		if (p.version !== body.version)
			throw new ConflictError(
				'O projeto foi atualizado. Recarregue antes de continuar.',
			);
		const approved = await tx.projectReport.count({
			where: { projectId: id, approved: true },
		});
		const pending = await tx.projectParticipant.count({
			where: { projectId: id, approvedHours: null },
		});
		validateTransition(p.status, body.status, manager(user), approved, pending);
		if (body.status === 'completed' && p.endsAt > new Date())
			throw new UnprocessableEntityError(
				'A conclusão depende do encerramento da vigência do projeto.',
			);
		if (body.status === 'active' && p.coordinatorId === user.id)
			throw new ForbiddenError(
				'A aprovação precisa ser feita por outra pessoa da gestão.',
			);
		await tx.projectEvent.create({
			data: {
				projectId: id,
				actorId: user.id,
				action: body.status,
				note: body.note.trim(),
			},
		});
		return tx.institutionalProject.update({
			where: { id },
			data: { status: body.status },
		});
	});
}
