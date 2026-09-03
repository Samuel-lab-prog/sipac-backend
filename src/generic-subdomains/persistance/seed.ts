import '../../../scripts/load-local-env';

import { prisma } from './prisma/prisma-client';
import { BcryptHashService } from '../../shared-kernel/infra/encrypting/bcrypt';
import { validateServerEnv } from '../../server-config/utils/validateEnv';

/* eslint-disable max-lines, max-lines-per-function -- deterministic integration fixture. */

const PASSWORD = 'password123';

async function upsertUserByEmail(params: {
	email: string;
	name: string;
	nickname: string;
	rg: string;
	cpf: string;
	role: 'student' | 'professor' | 'staff' | 'admin';
	status?: 'active' | 'pending' | 'blocked' | 'suspended';
}) {
	const passwordHash = await BcryptHashService.hash(PASSWORD);
	return prisma.user.upsert({
		where: { email: params.email },
		update: {
			...params,
			passwordHash,
			status: params.status ?? 'active',
		},
		create: {
			...params,
			passwordHash,
			status: params.status ?? 'active',
		},
	});
}

async function main() {
	validateServerEnv({ silent: true });

	const department = await prisma.department.upsert({
		where: { code: 'INF' },
		update: { name: 'Informática' },
		create: {
			name: 'Informática',
			code: 'INF',
		},
	});

	const languageDept = await prisma.department.upsert({
		where: { code: 'LET' },
		update: { name: 'Linguagens' },
		create: {
			name: 'Linguagens',
			code: 'LET',
		},
	});

	const course = await prisma.course.upsert({
		where: { code: 'INF-INT' },
		update: { departmentId: department.id, level: 'Ensino Médio Integrado' },
		create: {
			name: 'Informática Integrado ao Ensino Médio',
			code: 'INF-INT',
			level: 'Ensino Médio Integrado',
			departmentId: department.id,
		},
	});

	const academicPeriod = await prisma.academicPeriod.upsert({
		where: {
			year_term: { year: 2026, term: 2 },
		},
		update: {
			code: '2026.2',
			startsAt: new Date('2026-08-01T00:00:00.000Z'),
			endsAt: new Date('2026-12-20T23:59:59.000Z'),
		},
		create: {
			code: '2026.2',
			year: 2026,
			term: 2,
			startsAt: new Date('2026-08-01T00:00:00.000Z'),
			endsAt: new Date('2026-12-20T23:59:59.000Z'),
		},
	});

	const calendarEvents = [
		{
			type: 'holiday' as const,
			title: 'Independência do Brasil',
			description: 'Feriado nacional.',
			startsAt: '2026-09-07T00:00:00.000Z',
			endsAt: '2026-09-07T23:59:59.000Z',
			allDay: true,
			isInstructionalDay: false,
		},
		{
			type: 'academic_event' as const,
			title: 'Reunião pedagógica',
			description: 'Encontro de planejamento com a comunidade acadêmica.',
			startsAt: '2026-09-18T13:00:00.000Z',
			endsAt: '2026-09-18T17:00:00.000Z',
			allDay: false,
			isInstructionalDay: false,
		},
		{
			type: 'instructional_saturday' as const,
			title: 'Sábado letivo',
			description: 'Reposição de atividades do período.',
			startsAt: '2026-09-26T08:00:00.000Z',
			endsAt: '2026-09-26T12:00:00.000Z',
			allDay: false,
			isInstructionalDay: true,
		},
		{
			type: 'exam' as const,
			title: 'Avaliações parciais',
			description: 'Período reservado para avaliações parciais.',
			startsAt: '2026-10-19T00:00:00.000Z',
			endsAt: '2026-10-23T23:59:59.000Z',
			allDay: true,
			isInstructionalDay: true,
		},
		{
			type: 'break' as const,
			title: 'Recesso acadêmico',
			description: 'Recesso previsto no calendário letivo.',
			startsAt: '2026-11-02T00:00:00.000Z',
			endsAt: '2026-11-02T23:59:59.000Z',
			allDay: true,
			isInstructionalDay: false,
		},
	];
	for (const event of calendarEvents) {
		const startsAt = new Date(event.startsAt);
		const existing = await prisma.academicCalendarEvent.findFirst({
			where: {
				academicPeriodId: academicPeriod.id,
				title: event.title,
				startsAt,
			},
		});
		if (existing) {
			await prisma.academicCalendarEvent.update({
				where: { id: existing.id },
				data: event,
			});
		} else {
			await prisma.academicCalendarEvent.create({
				data: {
					...event,
					academicPeriodId: academicPeriod.id,
					startsAt,
					endsAt: new Date(event.endsAt),
				},
			});
		}
	}

	const staffUser = await upsertUserByEmail({
		email: 'marina.silva@staff.example',
		name: 'Marina Silva',
		nickname: 'marina.silva',
		rg: '90000001',
		cpf: '12345678001',
		role: 'staff',
	});

	const professorUser = await upsertUserByEmail({
		email: 'joao.pereira@prof.example',
		name: 'João Pereira',
		nickname: 'joao.pereira',
		rg: '90000002',
		cpf: '12345678002',
		role: 'professor',
	});

	const professorTwoUser = await upsertUserByEmail({
		email: 'ana.costa@prof.example',
		name: 'Ana Costa',
		nickname: 'ana.costa',
		rg: '90000005',
		cpf: '12345678003',
		role: 'professor',
	});

	const adminUser = await upsertUserByEmail({
		email: 'admin@agias.example',
		name: 'Administrador AGIAS',
		nickname: 'admin.agias',
		rg: '90000006',
		cpf: '12345678004',
		role: 'admin',
	});

	const studentUser = await upsertUserByEmail({
		email: 'samuel.monni@aluno.example',
		name: 'Samuel Gomes Monni',
		nickname: 'samuel.monni',
		rg: '90000003',
		cpf: '12345678100',
		role: 'student',
	});

	const studentTwoUser = await upsertUserByEmail({
		email: 'laura.martins@aluno.example',
		name: 'Laura Martins',
		nickname: 'laura.martins',
		rg: '90000004',
		cpf: '12345678101',
		role: 'student',
	});

	await prisma.staffProfile.upsert({
		where: { userId: staffUser.id },
		update: { departmentId: languageDept.id },
		create: {
			userId: staffUser.id,
			departmentId: languageDept.id,
		},
	});

	await prisma.professorProfile.upsert({
		where: { userId: professorUser.id },
		update: {
			registryCode: 'PROF-2026-001',
			departmentId: department.id,
			title: 'Doutor',
			workload: 40,
		},
		create: {
			userId: professorUser.id,
			registryCode: 'PROF-2026-001',
			departmentId: department.id,
			title: 'Doutor',
			workload: 40,
		},
	});

	await prisma.professorProfile.upsert({
		where: { userId: professorTwoUser.id },
		update: {
			registryCode: 'PROF-2026-002',
			departmentId: languageDept.id,
			title: 'Mestra',
			workload: 20,
		},
		create: {
			userId: professorTwoUser.id,
			registryCode: 'PROF-2026-002',
			departmentId: languageDept.id,
			title: 'Mestra',
			workload: 20,
		},
	});

	const communications = [
		{
			title: 'Reunião pedagógica',
			body: 'A staff realizará uma reunião geral com orientações para a próxima semana.',
			audience: 'all' as const,
			isPinned: true,
			publishedAt: new Date('2026-08-23T09:00:00.000-03:00'),
			expiresAt: null,
			createdByUserId: staffUser.id,
		},
		{
			title: 'Calendário de avaliações',
			body: 'As datas das avaliações parciais foram atualizadas no sistema.',
			audience: 'student' as const,
			isPinned: false,
			publishedAt: new Date('2026-08-22T16:00:00.000-03:00'),
			expiresAt: new Date('2026-09-30T23:59:59.000-03:00'),
			createdByUserId: staffUser.id,
		},
		{
			title: 'Manutenção programada do portal',
			body: 'O portal ficará indisponível no sábado, das 02h às 04h, para manutenção.',
			audience: 'all' as const,
			isPinned: false,
			publishedAt: new Date('2026-08-28T12:00:00.000-03:00'),
			expiresAt: new Date('2026-09-06T23:59:59.000-03:00'),
			createdByUserId: adminUser.id,
		},
	];

	for (const communication of communications) {
		const existing = await prisma.announcement.findFirst({
			where: { title: communication.title, createdByUserId: staffUser.id },
			select: { id: true },
		});

		if (existing) {
			await prisma.announcement.update({
				where: { id: existing.id },
				data: communication,
			});
		} else {
			await prisma.announcement.create({
				data: communication,
			});
		}
	}

	const studentProfile = await prisma.studentProfile.upsert({
		where: { userId: studentUser.id },
		update: {
			academicId: '2023326456',
			courseId: course.id,
			admissionYear: 2023,
			status: 'active',
		},
		create: {
			userId: studentUser.id,
			academicId: '2023326456',
			courseId: course.id,
			admissionYear: 2023,
			status: 'active',
		},
	});

	const studentTwoProfile = await prisma.studentProfile.upsert({
		where: { userId: studentTwoUser.id },
		update: {
			academicId: '2023326457',
			courseId: course.id,
			admissionYear: 2023,
			status: 'active',
		},
		create: {
			userId: studentTwoUser.id,
			academicId: '2023326457',
			courseId: course.id,
			admissionYear: 2023,
			status: 'active',
		},
	});

	const classOfferings = [
		{
			code: 'INF-INT-2026-2-TURMA-A',
			title: 'Informática Integrado - Turma A',
			shift: 'morning' as const,
			term: '2',
			year: 2026,
		},
		{
			code: 'INF-INT-2026-2-TURMA-B',
			title: 'Informática Integrado - Turma B',
			shift: 'morning' as const,
			term: '2',
			year: 2026,
		},
		{
			code: 'INF-INT-2026-2-TURMA-C',
			title: 'Língua Portuguesa e Literatura IV',
			shift: 'morning' as const,
			term: '2',
			year: 2026,
		},
		{
			code: 'INF-INT-2026-2-TURMA-D',
			title: 'Design para Web',
			shift: 'morning' as const,
			term: '2',
			year: 2026,
		},
		{
			code: 'INF-INT-2026-2-TURMA-E',
			title: 'Empreendedorismo em Informática',
			shift: 'afternoon' as const,
			term: '2',
			year: 2026,
		},
	];

	const createdClassOfferings = [];

	for (const item of classOfferings) {
		const classOffering = await prisma.classOffering.upsert({
			where: { code: item.code },
			update: {
				courseId: course.id,
				academicPeriodId: academicPeriod.id,
				shift: item.shift,
				term: item.term,
				year: item.year,
				title: item.title,
			},
			create: {
				courseId: course.id,
				academicPeriodId: academicPeriod.id,
				shift: item.shift,
				term: item.term,
				year: item.year,
				code: item.code,
				title: item.title,
			},
		});

		createdClassOfferings.push(classOffering);
	}

	const [
		classOfferingA,
		classOfferingB,
		classOfferingC,
		classOfferingD,
		classOfferingE,
	] = createdClassOfferings;

	for (const classOffering of createdClassOfferings) {
		await prisma.enrollment.upsert({
			where: {
				studentProfileId_classOfferingId: {
					studentProfileId: studentProfile.id,
					classOfferingId: classOffering.id,
				},
			},
			update: { status: 'active' },
			create: {
				studentProfileId: studentProfile.id,
				classOfferingId: classOffering.id,
				status: 'active',
			},
		});
	}

	for (const classOffering of createdClassOfferings.slice(2)) {
		await prisma.enrollment.upsert({
			where: {
				studentProfileId_classOfferingId: {
					studentProfileId: studentTwoProfile.id,
					classOfferingId: classOffering.id,
				},
			},
			update: { status: 'active' },
			create: {
				studentProfileId: studentTwoProfile.id,
				classOfferingId: classOffering.id,
				status: 'active',
			},
		});
	}

	await prisma.enrollment.upsert({
		where: {
			studentProfileId_classOfferingId: {
				studentProfileId: studentTwoProfile.id,
				classOfferingId: createdClassOfferings[0]!.id,
			},
		},
		update: { status: 'active' },
		create: {
			studentProfileId: studentTwoProfile.id,
			classOfferingId: classOfferingA!.id,
			status: 'active',
		},
	});

	await prisma.teachingAssignment.upsert({
		where: {
			professorProfileId_classOfferingId: {
				professorProfileId: (
					await prisma.professorProfile.findFirstOrThrow({
						where: { userId: professorUser.id },
					})
				).id,
				classOfferingId: createdClassOfferings[0]!.id,
			},
		},
		update: { role: 'lead' },
		create: {
			professorProfileId: (
				await prisma.professorProfile.findFirstOrThrow({
					where: { userId: professorUser.id },
				})
			).id,
			classOfferingId: classOfferingA!.id,
			role: 'lead',
		},
	});

	const professorProfile = await prisma.professorProfile.findUniqueOrThrow({
		where: { userId: professorUser.id },
	});
	const professorTwoProfile = await prisma.professorProfile.findUniqueOrThrow({
		where: { userId: professorTwoUser.id },
	});
	for (const [index, classOffering] of createdClassOfferings.entries()) {
		const professor = index % 2 === 0 ? professorProfile : professorTwoProfile;
		await prisma.teachingAssignment.upsert({
			where: {
				professorProfileId_classOfferingId: {
					professorProfileId: professor.id,
					classOfferingId: classOffering.id,
				},
			},
			update: { role: index === 0 ? 'lead' : 'assistant' },
			create: {
				professorProfileId: professor.id,
				classOfferingId: classOffering.id,
				role: index === 0 ? 'lead' : 'assistant',
			},
		});
	}

	const sessions = [
		{
			classOfferingId: createdClassOfferings[0]!.id,
			startsAt: new Date('2026-08-23T13:30:00.000-03:00'),
			endsAt: new Date('2026-08-23T14:20:00.000-03:00'),
			topic: 'Introdução ao conteúdo e combinados da disciplina',
		},
		{
			classOfferingId: createdClassOfferings[0]!.id,
			startsAt: new Date('2026-08-24T14:20:00.000-03:00'),
			endsAt: new Date('2026-08-24T15:10:00.000-03:00'),
			topic: 'Prática guiada em laboratório',
		},
		{
			classOfferingId: classOfferingB!.id,
			startsAt: new Date('2026-08-23T15:10:00.000-03:00'),
			endsAt: new Date('2026-08-23T16:00:00.000-03:00'),
			topic: 'Aula inaugural da turma B',
		},
		{
			classOfferingId: classOfferingC!.id,
			startsAt: new Date('2026-08-23T10:10:00.000-03:00'),
			endsAt: new Date('2026-08-23T11:00:00.000-03:00'),
			topic: 'Leitura orientada e introdução ao período literário',
		},
		{
			classOfferingId: classOfferingD!.id,
			startsAt: new Date('2026-08-24T13:30:00.000-03:00'),
			endsAt: new Date('2026-08-24T14:20:00.000-03:00'),
			topic: 'Interfaces, cores e composição visual',
		},
		{
			classOfferingId: classOfferingE!.id,
			startsAt: new Date('2026-08-24T16:10:00.000-03:00'),
			endsAt: new Date('2026-08-24T17:00:00.000-03:00'),
			topic: 'Modelo de negócio e validação da ideia',
		},
	];

	for (const session of sessions) {
		const existing = await prisma.classSession.findFirst({
			where: {
				classOfferingId: session.classOfferingId,
				startsAt: session.startsAt,
			},
			select: { id: true },
		});

		if (existing) {
			await prisma.classSession.update({
				where: { id: existing.id },
				data: {
					endsAt: session.endsAt,
					topic: session.topic,
				},
			});
		} else {
			await prisma.classSession.create({
				data: session,
			});
		}
	}

	const persistedSessions = await prisma.classSession.findMany({
		where: {
			classOfferingId: { in: createdClassOfferings.map((item) => item.id) },
		},
		orderBy: { startsAt: 'asc' },
	});
	for (const [index, session] of persistedSessions.entries()) {
		for (const [studentIndex, student] of [
			studentProfile,
			studentTwoProfile,
		].entries()) {
			if (studentIndex === 1 && index % 3 === 0) continue;
			await prisma.attendanceRecord.upsert({
				where: {
					classSessionId_studentProfileId: {
						classSessionId: session.id,
						studentProfileId: student.id,
					},
				},
				update: {
					status: index % 5 === 4 ? 'absent' : 'present',
					markedByProfessorProfileId: professorProfile.id,
				},
				create: {
					classSessionId: session.id,
					studentProfileId: student.id,
					status: index % 5 === 4 ? 'absent' : 'present',
					markedByProfessorProfileId: professorProfile.id,
				},
			});
		}
	}

	const activities = [
		{
			classOfferingId: createdClassOfferings[0]!.id,
			title: 'Lista 01',
			description: 'Introdução aos conceitos básicos.',
			dueAt: new Date('2026-08-25T23:59:59.000-03:00'),
			allowLateSubmissions: true,
		},
		{
			classOfferingId: createdClassOfferings[0]!.id,
			title: 'Atividade prática',
			description: 'Entrega individual no portal.',
			dueAt: new Date('2026-08-28T23:59:59.000-03:00'),
			allowLateSubmissions: false,
		},
		{
			classOfferingId: createdClassOfferings[1]!.id,
			title: 'Resumo da aula',
			description: 'Produzir um resumo do conteúdo visto em sala.',
			dueAt: new Date('2026-08-29T23:59:59.000-03:00'),
			allowLateSubmissions: true,
		},
		{
			classOfferingId: createdClassOfferings[2]!.id,
			title: 'Interpretação de texto',
			description: 'Responder às questões sobre o capítulo lido.',
			dueAt: new Date('2026-08-27T23:59:59.000-03:00'),
			allowLateSubmissions: true,
		},
		{
			classOfferingId: createdClassOfferings[3]!.id,
			title: 'Protótipo visual',
			description: 'Criar a primeira versão da landing page da disciplina.',
			dueAt: new Date('2026-08-30T23:59:59.000-03:00'),
			allowLateSubmissions: false,
		},
		{
			classOfferingId: createdClassOfferings[4]!.id,
			title: 'Canvas da ideia',
			description: 'Descrever problema, solução e público-alvo.',
			dueAt: new Date('2026-09-01T23:59:59.000-03:00'),
			allowLateSubmissions: true,
		},
	];

	for (const activity of activities) {
		const existing = await prisma.academicActivity.findFirst({
			where: {
				classOfferingId: activity.classOfferingId,
				title: activity.title,
			},
			select: { id: true },
		});

		if (existing) {
			await prisma.academicActivity.update({
				where: { id: existing.id },
				data: {
					description: activity.description,
					dueAt: activity.dueAt,
					allowLateSubmissions: activity.allowLateSubmissions,
				},
			});
		} else {
			await prisma.academicActivity.create({
				data: activity,
			});
		}
	}

	const submissions = [
		{
			classOfferingCode: classOfferingA!.code,
			activityTitle: 'Lista 01',
			grade: '9.50',
			feedback: 'Muito boa participação e boa organização.',
			submittedAt: new Date('2026-08-25T20:15:00.000-03:00'),
			studentProfileId: studentProfile.id,
			attachments: [
				{
					fileName: 'lista-01-respostas.pdf',
					fileUrl:
						'https://files.example.test/submissions/lista-01-respostas.pdf',
					fileKey: 'seed/submissions/lista-01-respostas.pdf',
					contentType: 'application/pdf',
					fileSize: 184_320,
				},
			],
		},
		{
			classOfferingCode: classOfferingC!.code,
			activityTitle: 'Interpretação de texto',
			grade: '8.75',
			feedback: 'Respostas completas, com margem para aprofundar a análise.',
			submittedAt: new Date('2026-08-29T18:40:00.000-03:00'),
			studentProfileId: studentProfile.id,
			attachments: [
				{
					fileName: 'analise-literaria.docx',
					fileUrl:
						'https://files.example.test/submissions/analise-literaria.docx',
					fileKey: 'seed/submissions/analise-literaria.docx',
					contentType:
						'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
					fileSize: 76_800,
				},
				{
					fileName: 'referencias.mp3',
					fileUrl: 'https://files.example.test/submissions/referencias.mp3',
					fileKey: 'seed/submissions/referencias.mp3',
					contentType: 'audio/mpeg',
					fileSize: 2_457_600,
				},
			],
		},
		{
			classOfferingCode: classOfferingD!.code,
			activityTitle: 'Protótipo visual',
			grade: null,
			feedback: null,
			submittedAt: new Date('2026-09-02T10:30:00.000-03:00'),
			studentProfileId: studentTwoProfile.id,
			attachments: [
				{
					fileName: 'prototipo-home.png',
					fileUrl: 'https://files.example.test/submissions/prototipo-home.png',
					fileKey: 'seed/submissions/prototipo-home.png',
					contentType: 'image/png',
					fileSize: 512_000,
				},
			],
		},
	];

	for (const submission of submissions) {
		const classOffering = createdClassOfferings.find(
			(item) => item.code === submission.classOfferingCode,
		);
		if (!classOffering) continue;

		const activity = await prisma.academicActivity.findFirstOrThrow({
			where: {
				classOfferingId: classOffering.id,
				title: submission.activityTitle,
			},
			select: { id: true },
		});

		const existingSubmission =
			await prisma.academicActivitySubmission.findFirst({
				where: {
					activityId: activity.id,
					studentProfileId: submission.studentProfileId,
				},
				select: { id: true },
			});

		if (existingSubmission) {
			await prisma.academicActivitySubmission.update({
				where: { id: existingSubmission.id },
				data: {
					submittedAt: submission.submittedAt,
					grade: submission.grade,
					feedback: submission.feedback,
				},
			});
		} else {
			const createdSubmission = await prisma.academicActivitySubmission.create({
				data: {
					activityId: activity.id,
					studentProfileId: submission.studentProfileId,
					submittedAt: submission.submittedAt,
					grade: submission.grade,
					feedback: submission.feedback,
				},
			});
			await prisma.academicActivitySubmissionAttachment.createMany({
				data: submission.attachments.map((attachment) => ({
					...attachment,
					submissionId: createdSubmission.id,
				})),
			});
		}

		if (existingSubmission) {
			await prisma.academicActivitySubmissionAttachment.deleteMany({
				where: { submissionId: existingSubmission.id },
			});
			await prisma.academicActivitySubmissionAttachment.createMany({
				data: submission.attachments.map((attachment) => ({
					...attachment,
					submissionId: existingSubmission.id,
				})),
			});
		}
	}

	const submissionComments = [
		{
			classOfferingCode: classOfferingA!.code,
			activityTitle: 'Lista 01',
			studentProfileId: studentProfile.id,
			body: 'Professor, fiquei com dúvida na questão 4. Poderia indicar uma referência?',
		},
		{
			classOfferingCode: classOfferingD!.code,
			activityTitle: 'Protótipo visual',
			studentProfileId: studentTwoProfile.id,
			body: 'Enviei a primeira versão do protótipo e aguardo suas orientações.',
		},
	];
	for (const comment of submissionComments) {
		const classOffering = createdClassOfferings.find(
			(item) => item.code === comment.classOfferingCode,
		);
		if (!classOffering) continue;
		const activity = await prisma.academicActivity.findFirst({
			where: {
				classOfferingId: classOffering.id,
				title: comment.activityTitle,
			},
			select: { id: true },
		});
		if (!activity) continue;
		const submission = await prisma.academicActivitySubmission.findUnique({
			where: {
				activityId_studentProfileId: {
					activityId: activity.id,
					studentProfileId: comment.studentProfileId,
				},
			},
			select: { id: true },
		});
		if (!submission) continue;
		const existingComment =
			await prisma.academicActivitySubmissionComment.findFirst({
				where: {
					submissionId: submission.id,
					authorUserId:
						comment.studentProfileId === studentProfile.id
							? studentUser.id
							: studentTwoUser.id,
					body: comment.body,
				},
				select: { id: true },
			});
		if (!existingComment) {
			await prisma.academicActivitySubmissionComment.create({
				data: {
					submissionId: submission.id,
					authorUserId:
						comment.studentProfileId === studentProfile.id
							? studentUser.id
							: studentTwoUser.id,
					body: comment.body,
				},
			});
		}
	}

	const activityAttachments = [
		{
			activityTitle: 'Lista 01',
			fileName: 'roteiro-lista-01.pdf',
			fileUrl: 'https://files.example.test/activities/roteiro-lista-01.pdf',
			fileKey: 'seed/activities/roteiro-lista-01.pdf',
			contentType: 'application/pdf',
			fileSize: 245_760,
		},
		{
			activityTitle: 'Protótipo visual',
			fileName: 'referencia-layout.jpg',
			fileUrl: 'https://files.example.test/activities/referencia-layout.jpg',
			fileKey: 'seed/activities/referencia-layout.jpg',
			contentType: 'image/jpeg',
			fileSize: 98_304,
		},
	];
	for (const attachment of activityAttachments) {
		const { activityTitle, ...fileData } = attachment;
		const activity = await prisma.academicActivity.findFirst({
			where: { title: activityTitle },
			select: { id: true },
		});
		if (!activity) continue;
		const existingAttachment =
			await prisma.academicActivityAttachment.findFirst({
				where: { activityId: activity.id, fileKey: fileData.fileKey },
				select: { id: true },
			});
		if (existingAttachment) {
			await prisma.academicActivityAttachment.update({
				where: { id: existingAttachment.id },
				data: fileData,
			});
		} else {
			await prisma.academicActivityAttachment.create({
				data: { ...fileData, activityId: activity.id },
			});
		}
	}

	console.log(
		JSON.stringify(
			{
				message: 'Realistic demo seed created/updated successfully.',
				accounts: [
					{ role: 'student', email: studentUser.email, cpf: '12345678100' },
					{ role: 'student', email: studentTwoUser.email, cpf: '12345678101' },
					{ role: 'professor', email: professorUser.email, cpf: '12345678002' },
					{
						role: 'professor',
						email: professorTwoUser.email,
						cpf: '12345678003',
					},
					{ role: 'staff', email: staffUser.email, cpf: '12345678001' },
					{ role: 'admin', email: adminUser.email, cpf: '12345678004' },
				],
				loginPassword: PASSWORD,
			},
			null,
			2,
		),
	);
}

main().catch((error) => {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
});
