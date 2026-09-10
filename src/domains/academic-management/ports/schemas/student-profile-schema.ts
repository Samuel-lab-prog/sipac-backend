import { t } from 'elysia';
import { idSchema } from '@SharedKernel/schemas/schemas';

const admissionYearSchema = t.Number({
	minimum: 1900,
	maximum: 2100,
	example: 2026,
});

export const studentProfileSchema = t.Intersect([
	t.Object({
		id: idSchema,
		userId: idSchema,
		academicId: t.String({ minLength: 3, example: '2026000123' }),
		courseId: t.Nullable(idSchema),
		admissionYear: t.Nullable(admissionYearSchema),
		status: t.String({ example: 'active' }),
	}),
	t.Partial(
		t.Object({
			birthDate: t.Nullable(t.Date()),
			gender: t.Nullable(t.String()),
			genderIdentity: t.Nullable(t.String()),
			sexualOrientation: t.Nullable(t.String()),
			race: t.Nullable(t.String()),
			nationality: t.Nullable(t.String()),
			birthplace: t.Nullable(t.String()),
			birthCountry: t.Nullable(t.String()),
			maritalStatus: t.Nullable(t.String()),
			bloodType: t.Nullable(t.String()),
			disability: t.Nullable(t.String()),
			fatherName: t.Nullable(t.String()),
			motherName: t.Nullable(t.String()),
			rgIssueDate: t.Nullable(t.Date()),
			rgIssuer: t.Nullable(t.String()),
			rgState: t.Nullable(t.String()),
			electoralTitle: t.Nullable(t.String()),
			electoralZone: t.Nullable(t.String()),
			electoralSection: t.Nullable(t.String()),
			militaryCertificate: t.Nullable(t.String()),
			documentSeries: t.Nullable(t.String()),
			postalCode: t.Nullable(t.String()),
			street: t.Nullable(t.String()),
			addressNumber: t.Nullable(t.String()),
			addressComplement: t.Nullable(t.String()),
			neighborhood: t.Nullable(t.String()),
			state: t.Nullable(t.String()),
			city: t.Nullable(t.String()),
			phone: t.Nullable(t.String()),
			mobilePhone: t.Nullable(t.String()),
			familyIncome: t.Nullable(t.Number()),
			socioeconomicStatus: t.Nullable(t.String()),
		}),
	),
]);
