import type { FeedItem } from './models';

export type GetFeedParams = {
	userId: number;
};

export interface QueriesRouterServices {
	getFeed(params: GetFeedParams): Promise<FeedItem[]>;
}
