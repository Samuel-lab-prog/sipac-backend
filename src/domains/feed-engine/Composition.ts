import { getFeedFactory } from './use-cases/queries/Index';
import { createFeedQueriesRouter } from './adapters/QueriesRouter';
import type { QueriesRouterServices } from './ports/queries';
import { poemsFeedContract } from '@Domains/poems-management/public/Index';
import { friendsPublicContract } from '@Domains/friends-management/public/Index';

export const queriesRouterServices: QueriesRouterServices = {
	getFeed: getFeedFactory({
		poemsServices: poemsFeedContract,
		friendsServices: friendsPublicContract,
	}),
};

export const feedQueriesRouter = createFeedQueriesRouter(queriesRouterServices);
