import type { SlugService } from '../../ports/externalServices';
import slugify from 'slugify';

function generateUniqueSlug(title: string): string {
	return slugify(title, { lower: true, strict: true });
}

export const slugifyService: SlugService = {
	generateSlug: generateUniqueSlug,
};
