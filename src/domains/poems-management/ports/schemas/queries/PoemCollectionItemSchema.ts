import { t } from 'elysia';
import { DateSchema, idSchema } from '@SharedKernel/Schemas';
import { PoemSlugSchema, PoemTitleSchema } from '../PoemFieldsSchemas';

export const PoemCollectionItemSchema = t.Object({
	id: idSchema,
	collectionId: idSchema,
	title: PoemTitleSchema,
	slug: PoemSlugSchema,
	savedAt: DateSchema,
});
