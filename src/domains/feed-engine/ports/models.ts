import { FeedPoemSchema } from '../ports/schemas/FeedPoemsSchema';

export type FeedItem = (typeof FeedPoemSchema)['static'];
