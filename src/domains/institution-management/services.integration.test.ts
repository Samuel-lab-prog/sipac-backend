import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { Elysia } from 'elysia';
import { prisma } from '@Prisma';
import { PDFDocument } from 'pdf-lib';
import { ErrorPlugin } from '../../generic-subdomains/utils/error-handling/error-plugin/util';
import { JwtTokenService } from '../../generic-subdomains/authentication/infra/jwt-token-service/jwt-token-service';
import { projectsRouter } from '../projects-management/router';
import {
	documentsRouter,
	documentVerificationRouter,
} from '../documents-management/router';
import { institutionRouter } from './router';

describe.skipIf(process.env.NODE_ENV !== 'test')(
	'INTEGRATION institutional services',
	() => {
		const app = new Elysia()
			.use(ErrorPlugin)
			.use(documentVerificationRouter)
			.use(projectsRouter)
			.use(documentsRouter)
			.use(institutionRouter);
		const prefix = 'TEST-SERVICES-' + Date.now();
		const users: Record<string, { id: number; role: string; email: string }> =
			{};
		const cookie: Record<string, string> = {};
		let institutionId: number,
			campusId: number,
			otherCampusId: number,
			departmentId: number,
			courseId: number,
			periodId: number,
			offeringId: number,
			profileId: number,
			projectId: number,
			participantId: number,
			documentId: string,
			verificationCode: string;
		const dates = {
			startsAt: new Date(Date.now() - 90 * 86400000).toISOString(),
			endsAt: new Date(Date.now() - 5 * 86400000).toISOString(),
		};
		beforeAll(async () => {
			const institution = await prisma.institution.create({
				data: { name: prefix, acronym: 'TEST', configured: true },
			});
			institutionId = institution.id;
			for (const [index, name] of ['Principal', 'Outro'].entries()) {
				const campus = await prisma.campus.create({
					data: {
						institutionId,
						name,
						address: 'Rua de testes, 1',
						city: 'Erechim',
						state: 'RS',
					},
				});
				if (index === 0) campusId = campus.id;
				else otherCampusId = campus.id;
			}
			for (const [index, key] of [
				'staff',
				'admin',
				'professor',
				'student',
				'outsider',
				'foreign',
			].entries()) {
				const role =
					key === 'outsider'
						? 'student'
						: key === 'foreign'
							? 'staff'
							: (key as 'staff' | 'admin' | 'professor' | 'student');
				const user = await prisma.user.create({
					data: {
						name: 'Pessoa ' + key,
						email: prefix + '-' + key + '@test.example',
						nickname: prefix + key,
						cpf: prefix + index,
						rg: prefix + index,
						passwordHash: 'test-only-not-a-real-password',
						role,
						campusId: key === 'foreign' ? otherCampusId : campusId,
					},
				});
				users[key] = user;
				cookie[key] =
					'token=' +
					JwtTokenService.generateToken(
						{
							clientId: user.id,
							email: user.email,
							role: user.role,
							tokenType: 'access',
						},
						600,
					);
			}
			const department = await prisma.department.create({
				data: { name: prefix, code: prefix, campusId },
			});
			departmentId = department.id;
			const course = await prisma.course.create({
				data: { name: prefix, code: prefix, level: 'technical', departmentId },
			});
			courseId = course.id;
			const period = await prisma.academicPeriod.create({
				data: {
					campusId,
					code: prefix,
					year: 9000 + institutionId,
					term: 1,
					startsAt: new Date(Date.now() - 86400000),
					endsAt: new Date(Date.now() + 86400000),
				},
			});
			periodId = period.id;
			const profile = await prisma.studentProfile.create({
				data: { userId: users.student!.id, academicId: prefix, courseId },
			});
			profileId = profile.id;
			const offering = await prisma.classOffering.create({
				data: {
					courseId,
					academicPeriodId: periodId,
					year: 2026,
					term: '1',
					shift: 'morning',
					code: prefix,
					title: 'Disciplina de teste',
				},
			});
			offeringId = offering.id;
			await prisma.enrollment.create({
				data: { studentProfileId: profileId, classOfferingId: offeringId },
			});
		});
		afterAll(async () => {
			await prisma.issuedDocument.deleteMany({
				where: { campusId: { in: [campusId, otherCampusId].filter(Boolean) } },
			});
			const ids = (
				await prisma.institutionalProject.findMany({
					where: { campusId },
					select: { id: true },
				})
			).map((p) => p.id);
			await prisma.projectEvent.deleteMany({
				where: { projectId: { in: ids } },
			});
			await prisma.projectReport.deleteMany({
				where: { projectId: { in: ids } },
			});
			await prisma.projectParticipant.deleteMany({
				where: { projectId: { in: ids } },
			});
			await prisma.institutionalProject.deleteMany({
				where: { id: { in: ids } },
			});
			if (offeringId)
				await prisma.classOffering.delete({ where: { id: offeringId } });
			await prisma.user.deleteMany({
				where: { id: { in: Object.values(users).map((u) => u.id) } },
			});
			if (courseId) await prisma.course.delete({ where: { id: courseId } });
			if (departmentId)
				await prisma.department.delete({ where: { id: departmentId } });
			if (periodId)
				await prisma.academicPeriod.delete({ where: { id: periodId } });
			await prisma.campus.deleteMany({ where: { institutionId } });
			if (institutionId)
				await prisma.institution.delete({ where: { id: institutionId } });
		});
		function request(
			path: string,
			role = 'staff',
			method = 'GET',
			body?: unknown,
		) {
			return app.handle(
				new Request('http://localhost' + path, {
					method,
					headers: {
						cookie: cookie[role] ?? '',
						...(body ? { 'content-type': 'application/json' } : {}),
					},
					body: body ? JSON.stringify(body) : undefined,
				}),
			);
		}
		async function json(
			path: string,
			role = 'staff',
			method = 'GET',
			body?: unknown,
		): Promise<any> {
			const response = await request(path, role, method, body);
			const data = (await response.json()) as any;
			if (!response.ok)
				throw new Error(
					JSON.stringify({ path, status: response.status, data }),
				);
			return data;
		}
		it('requires authentication and active account, returns readable identity', async () => {
			expect([401, 422]).toContain(
				(await request('/institution/context', 'none')).status,
			);
			expect((await json('/institution/context')).campus.name).toBe(
				'Principal',
			);
			await prisma.user.update({
				where: { id: users.outsider!.id },
				data: { status: 'blocked' },
			});
			expect((await request('/institution/context', 'outsider')).ok).toBe(
				false,
			);
			await prisma.user.update({
				where: { id: users.outsider!.id },
				data: { status: 'active' },
			});
		});
		it('only admin can configure identity', async () => {
			const body = {
				institutionName: 'Instituição de teste',
				acronym: 'TEST',
				campusName: 'Principal',
				city: 'Erechim',
				state: 'RS',
				address: 'Rua de testes, 1',
			};
			expect(
				(await request('/institution/identity', 'staff', 'PUT', body)).status,
			).toBe(403);
			expect(
				(await request('/institution/identity', 'admin', 'PUT', body)).status,
			).toBe(200);
		});
		it('creates projects and denies student creation and foreign visibility', async () => {
			const body = {
				...dates,
				title: 'Pesquisa de teste',
				objectives: 'Objetivos de pesquisa registrados para teste.',
				kind: 'research',
				origin: 'external',
				departmentId,
				researchLine: 'Tecnologias educacionais',
				knowledgeArea: 'Ciência da Computação',
				fundingAgency: 'CNPq',
			};
			expect(
				(await request('/projects/', 'student', 'POST', body)).status,
			).toBe(403);
			expect(
				(
					await request('/projects/', 'professor', 'POST', {
						...body,
						endsAt: new Date(0).toISOString(),
					})
				).status,
			).toBe(422);
			const created = await json('/projects/', 'professor', 'POST', body);
			projectId = created.id;
			expect(created.code).toMatch(/^P\d{7}-\d{4}$/);
			expect(created.origin).toBe('external');
			expect(created.department.name).toBe(prefix);
			expect(created.finalReportStatus).toBe('not_submitted');
			expect((await json('/projects/', 'staff')).total).toBe(1);
			expect((await json('/projects/?ownership=mine', 'staff')).total).toBe(0);
			expect((await json('/projects/?ownership=all', 'professor')).total).toBe(
				0,
			);
			expect(
				(await json('/projects/?code=' + created.code, 'staff')).total,
			).toBe(1);
			expect(
				(await json('/projects/?researcher=Pessoa%20professor', 'staff')).total,
			).toBe(1);
			expect(
				(await json('/projects/?departmentId=' + departmentId, 'staff')).total,
			).toBe(1);
			expect((await json('/projects/?scope=institution', 'staff')).total).toBe(
				1,
			);
			const reportResponse = await request(
				'/projects/report?code=' + encodeURIComponent(created.code),
				'staff',
			);
			expect(reportResponse.status).toBe(200);
			expect(reportResponse.headers.get('content-type')).toContain('text/csv');
			expect(await reportResponse.text()).toContain('Pesquisa de teste');
			expect((await request('/projects/' + projectId, 'foreign')).status).toBe(
				404,
			);
			expect((await request('/projects/' + projectId, 'outsider')).status).toBe(
				404,
			);
		});
		it('adds participant, protects membership and approves through another manager', async () => {
			const body = {
				...dates,
				userId: users.student!.id,
				role: 'Bolsista',
				workPlan: 'Plano de trabalho com atividades e entregas.',
			};
			participantId = (
				await json(
					'/projects/' + projectId + '/participants',
					'professor',
					'POST',
					body,
				)
			).id;
			expect(
				(
					await request(
						'/projects/' + projectId + '/participants',
						'professor',
						'POST',
						body,
					)
				).status,
			).toBe(409);
			expect((await request('/projects/' + projectId, 'student')).status).toBe(
				200,
			);
			expect(
				(
					await request(
						'/projects/' + projectId + '/participants',
						'student',
						'POST',
						{ ...body, userId: users.outsider!.id },
					)
				).status,
			).toBe(403);
			let p = await json('/projects/' + projectId);
			await json('/projects/' + projectId + '/status', 'professor', 'POST', {
				status: 'submitted',
				version: p.version,
				note: 'Proposta pronta para avaliação.',
			});
			expect(
				(
					await request('/projects/' + projectId + '/status', 'staff', 'POST', {
						status: 'active',
						version: p.version,
						note: 'Versão desatualizada.',
					})
				).status,
			).toBe(409);
			p = await json('/projects/' + projectId);
			expect(
				(
					await request(
						'/projects/' + projectId + '/status',
						'professor',
						'POST',
						{
							status: 'active',
							version: p.version,
							note: 'Aprovação própria.',
						},
					)
				).status,
			).toBe(403);
			await json('/projects/' + projectId + '/status', 'staff', 'POST', {
				status: 'active',
				version: p.version,
				note: 'Proposta aprovada pela secretaria.',
			});
			expect((await json('/projects/?ownership=all', 'student')).total).toBe(1);
		});
		it('requires approved report and hours before completion and certificate', async () => {
			const path = '/projects/' + projectId;
			let p = await json(path);
			expect(
				(
					await request(path + '/status', 'staff', 'POST', {
						status: 'completed',
						version: p.version,
						note: 'Concluir projeto.',
					})
				).status,
			).toBe(422);
			expect(
				(
					await request('/documents/', 'student', 'POST', {
						kind: 'participation',
						participantId,
					})
				).status,
			).toBe(422);
			const report = await json(path + '/reports', 'student', 'POST', {
				title: 'Relatório final',
				body: 'Resultados obtidos e atividades desenvolvidas.',
			});
			expect(
				(
					await request(
						path + '/reports/' + report.id + '/approve',
						'student',
						'POST',
					)
				).status,
			).toBe(403);
			await json(path + '/reports/' + report.id + '/approve', 'staff', 'POST');
			await json(
				path + '/participants/' + participantId + '/hours',
				'staff',
				'PUT',
				{ hours: 40 },
			);
			p = await json(path);
			await json(path + '/status', 'staff', 'POST', {
				status: 'completed',
				version: p.version,
				note: 'Relatório e horas homologados.',
			});
			const certificate = await json('/documents/', 'student', 'POST', {
				kind: 'participation',
				participantId,
			});
			expect(certificate.snapshot.paragraphs[0]).toContain('40 horas');
			expect(
				(
					await request(path + '/reports', 'student', 'POST', {
						title: 'Outra versão',
						body: 'Não editar projeto já encerrado.',
					})
				).status,
			).toBe(409);
		});
		it('issues enrollment PDF with immutable snapshot and restricted download', async () => {
			const doc = await json('/documents/', 'student', 'POST', {
				kind: 'enrollment',
			});
			documentId = doc.id;
			verificationCode = doc.verificationCode;
			expect(doc.snapshot.paragraphs.join(' ')).toContain(
				'Disciplina de teste',
			);
			const response = await request(
				'/documents/' + documentId + '/pdf',
				'student',
			);
			expect(response.status).toBe(200);
			const pdf = await PDFDocument.load(await response.arrayBuffer());
			expect(pdf.getPageCount()).toBeGreaterThan(0);
			expect(
				(await request('/documents/' + documentId + '/pdf', 'outsider')).status,
			).toBe(404);
			expect(
				(await request('/documents/' + documentId + '/pdf', 'foreign')).status,
			).toBe(404);
			await prisma.user.update({
				where: { id: users.student!.id },
				data: { name: 'Nome atualizado' },
			});
			const verify = await json(
				'/documents/verify/' + verificationCode,
				'none',
			);
			expect(verify.subjectName).toBe('Pessoa student');
			expect(verify).not.toHaveProperty('snapshot');
			expect(verify).not.toHaveProperty('email');
		});
		it('refuses impersonation and enrollment outside current period', async () => {
			expect(
				(
					await request('/documents/', 'outsider', 'POST', {
						kind: 'affiliation',
						subjectUserId: users.student!.id,
					})
				).status,
			).toBe(403);
			await prisma.enrollment.updateMany({
				where: { studentProfileId: profileId },
				data: { status: 'completed' },
			});
			expect(
				(
					await request('/documents/', 'student', 'POST', {
						kind: 'enrollment',
					})
				).status,
			).toBe(422);
			await prisma.enrollment.updateMany({
				where: { studentProfileId: profileId },
				data: { status: 'active' },
			});
			await prisma.academicPeriod.update({
				where: { id: periodId },
				data: { endsAt: new Date(Date.now() - 3600000) },
			});
			expect(
				(
					await request('/documents/', 'student', 'POST', {
						kind: 'affiliation',
					})
				).status,
			).toBe(422);
		});
		it('revokes with persistent verification and blocks new downloads', async () => {
			expect(
				(
					await request(
						'/documents/' + documentId + '/revoke',
						'student',
						'POST',
						{ reason: 'Solicitação de revogação.' },
					)
				).status,
			).toBe(403);
			await json('/documents/' + documentId + '/revoke', 'staff', 'POST', {
				reason: 'Correção do registro institucional.',
			});
			expect(
				(await json('/documents/verify/' + verificationCode, 'none')).revokedAt,
			).not.toBeNull();
			expect(
				(await request('/documents/' + documentId + '/pdf', 'student')).status,
			).toBe(409);
			expect(
				(await request('/documents/verify/' + '0'.repeat(48), 'none')).status,
			).toBe(404);
		});
	},
);
