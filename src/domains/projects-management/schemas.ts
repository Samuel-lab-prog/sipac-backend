import { t, type Static } from 'elysia';
export const id = t.Numeric({ minimum: 1, multipleOf: 1 });
export const params = t.Object({ id });
export const text = (min: number, max: number) =>
	t.String({ minLength: min, maxLength: max, pattern: '\\S' });
export const date = t.String({ format: 'date-time' });
export const projectBody = t.Object({
	title: text(3, 200),
	objectives: text(10, 10000),
	kind: t.UnionEnum(['teaching', 'research', 'extension']),
	origin: t.Optional(t.UnionEnum(['internal', 'external'])),
	departmentId: t.Optional(id),
	researchLine: t.Optional(text(2, 200)),
	knowledgeArea: t.Optional(text(2, 200)),
	researchGroup: t.Optional(text(2, 200)),
	fundingAgency: t.Optional(text(2, 200)),
	callName: t.Optional(text(2, 200)),
	nature: t.Optional(text(2, 100)),
	researchType: t.Optional(text(2, 100)),
	startsAt: date,
	endsAt: date,
});
export const participantBody = t.Object({
	userId: id,
	role: text(2, 100),
	workPlan: text(10, 10000),
	startsAt: date,
	endsAt: date,
});
export const transitionBody = t.Object({
	status: t.UnionEnum([
		'draft',
		'submitted',
		'active',
		'completed',
		'cancelled',
	]),
	version: t.Integer({ minimum: 1 }),
	note: text(3, 2000),
});
export const listQuery = t.Object({
	page: t.Optional(t.Numeric({ minimum: 1, maximum: 100000, multipleOf: 1 })),
	ownership: t.Optional(t.UnionEnum(['mine', 'all'], { default: undefined })),
	scope: t.Optional(
		t.UnionEnum(['campus', 'institution'], { default: undefined }),
	),
	q: t.Optional(t.String({ maxLength: 100 })),
	code: t.Optional(t.String({ maxLength: 50 })),
	year: t.Optional(t.Numeric({ minimum: 2000, maximum: 2200, multipleOf: 1 })),
	researcher: t.Optional(t.String({ maxLength: 100 })),
	departmentId: t.Optional(t.Numeric({ minimum: 1, multipleOf: 1 })),
	researchLine: t.Optional(t.String({ maxLength: 100 })),
	knowledgeArea: t.Optional(t.String({ maxLength: 100 })),
	researchGroup: t.Optional(t.String({ maxLength: 100 })),
	fundingAgency: t.Optional(t.String({ maxLength: 100 })),
	callName: t.Optional(t.String({ maxLength: 100 })),
	nature: t.Optional(t.String({ maxLength: 100 })),
	researchType: t.Optional(t.String({ maxLength: 100 })),
	kind: t.Optional(
		t.UnionEnum(['teaching', 'research', 'extension'], { default: undefined }),
	),
	origin: t.Optional(
		t.UnionEnum(['internal', 'external'], { default: undefined }),
	),
	status: t.Optional(
		t.UnionEnum(['draft', 'submitted', 'active', 'completed', 'cancelled'], {
			default: undefined,
		}),
	),
	finalReport: t.Optional(
		t.UnionEnum(['not_submitted', 'submitted', 'approved'], {
			default: undefined,
		}),
	),
});
export const scopeQuery = t.Object({
	scope: t.Optional(
		t.UnionEnum(['campus', 'institution'], { default: undefined }),
	),
});
export type ProjectBody = Static<typeof projectBody>;
export type ParticipantBody = Static<typeof participantBody>;
export type TransitionBody = Static<typeof transitionBody>;
export type ProjectListQuery = Static<typeof listQuery>;
