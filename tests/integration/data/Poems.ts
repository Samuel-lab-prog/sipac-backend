import type {
	UpdatePoem,
	CreatePoem,
} from '@Domains/poems-management/ports/models';

function generatePoemsData(quantity: number): CreatePoem[] {
	const data: CreatePoem[] = [];
	for (let i = 1; i <= quantity; i++) {
		data.push({
			title: `Poem Title ${i}`,
			content: `This is the content of poem ${i}.`,
			excerpt: `Excerpt of poem ${i}.`,
			tags: [`tag${i}`, `tag${i + 1}`],
		});
	}
	return data;
}

function generatePoemsForUpdate(quantity: number): UpdatePoem[] {
	const data: UpdatePoem[] = [];
	for (let i = 1; i <= quantity; i++) {
		data.push({
			title: `Updated Poem Title ${i}`,
			content: `This is the updated content of poem ${i}.`,
			excerpt: `Updated excerpt of poem ${i}.`,
			tags: [`updatedTag${i}`, `updatedTag${i + 1}`],
			isCommentable: i % 2 === 0,
			visibility: i % 2 === 0 ? 'private' : 'public',
			status: i % 2 === 0 ? 'draft' : 'published',
			toUserIds: [],
		});
	}
	return data;
}
const POEMS_QUANTITY = 10;
const POEMS_FOR_UPDATE_QUANTITY = 10;

export const poemsData = generatePoemsData(POEMS_QUANTITY);
export const poemsForUpdate = generatePoemsForUpdate(POEMS_FOR_UPDATE_QUANTITY);
