import type { PoemVisibility } from '@SharedKernel/Enums';

import type { FeedItem } from './models';

export interface PoemsFeedContract {
	getFeedPoemsByAuthorIds(params: {
		authorIds: number[];
		limit: number;
		visibilities?: PoemVisibility[];
		cursor?: Date;
	}): Promise<FeedItem[]>;

	getPublicFeedPoems(params: {
		limit: number;
		excludeAuthorIds?: number[];
		excludePoemIds?: number[];
		cursor?: Date;
	}): Promise<FeedItem[]>;
}
