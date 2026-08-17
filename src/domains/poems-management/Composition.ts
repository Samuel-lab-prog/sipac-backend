import { queriesRepository } from './infra/queries-repository/repository';
import type { QueriesRouterServices } from './ports/queries';
import { commandsRepository } from './infra/commands-repository/repository';
import { slugifyService } from './infra/slug-service/execute';
import { usersPublicContract } from '@Domains/users-management/public/Index';
import {
	getMyPoemsFactory,
	getAuthorPoemsFactory,
	getPoemFactory,
	getPoemsFactory,
	getPendingPoemsFactory,
} from './use-cases/queries/index';
import { createPoemsQueriesRouter } from './adapters/QueriesRouter';

import {
	createPoemFactory,
	requestPoemAudioUploadUrlFactory,
	updatePoemAudioFactory,
	updatePoemFactory,
} from './use-cases/commands/Index';

import type { CommandsRouterServices } from './ports/commands';
import { createPoemsCommandsRouter } from './adapters/CommandsRouter';
import { deletePoemFactory } from './use-cases/commands/delete-poem/execute';
import { savePoemFactory } from './use-cases/commands/save-poem/execute';
import { removeSavedPoemFactory } from './use-cases/commands/remove-saved/execute';
import { getSavedPoemsFactory } from './use-cases/queries/get-saved-poems/execute';
import { addCollectionItemFactory } from './use-cases/commands/add-item/execute';
import { removeCollectionItemFactory } from './use-cases/commands/remove-item/execute';
import { createCollectionFactory } from './use-cases/commands/create-collection/execute';
import { deleteCollectionFactory } from './use-cases/commands/delete-collection/execute';
import { getCollectionsFactory } from './use-cases/queries/get-collections/execute';
import { storageService } from '@SharedKernel/infra/storage/storage.service';

const commandsRouterServices: CommandsRouterServices = {
	createPoem: createPoemFactory({
		commandsRepository,
		slugService: slugifyService,
		usersContract: usersPublicContract,
	}),
	updatePoem: updatePoemFactory({
		commandsRepository,
		queriesRepository,
		slugService: slugifyService,
		usersContract: usersPublicContract,
	}),
	requestPoemAudioUploadUrl: requestPoemAudioUploadUrlFactory({
		storageService,
		queriesRepository,
	}),
	updatePoemAudio: updatePoemAudioFactory({
		commandsRepository,
		queriesRepository,
	}),
	deletePoem: deletePoemFactory({
		commandsRepository,
		queriesRepository,
	}),
	savePoem: savePoemFactory({
		commandsRepository,
		queriesRepository,
		usersContract: usersPublicContract,
	}),
	removeSavedPoem: removeSavedPoemFactory({
		commandsRepository,
		usersContract: usersPublicContract,
		queriesRepository,
	}),
	addItemToCollection: addCollectionItemFactory({
		commandsRepository,
	}),
	removeItemFromCollection: removeCollectionItemFactory({
		commandsRepository,
	}),
	createCollection: createCollectionFactory({
		commandsRepository,
		queriesRepository,
	}),
	deleteCollection: deleteCollectionFactory({
		commandsRepository,
	}),
};

const queriesRouterServices: QueriesRouterServices = {
	getMyPoems: getMyPoemsFactory({
		poemQueriesRepository: queriesRepository,
	}),
	getAuthorPoems: getAuthorPoemsFactory({
		poemQueriesRepository: queriesRepository,
	}),
	getPoemById: getPoemFactory({
		poemQueriesRepository: queriesRepository,
	}),
	getPendingPoems: getPendingPoemsFactory({
		poemQueriesRepository: queriesRepository,
	}),
	searchPoems: getPoemsFactory({
		queriesRepository,
	}),
	getSavedPoems: getSavedPoemsFactory({
		queriesRepository,
		usersContract: usersPublicContract,
	}),
	getCollections: getCollectionsFactory({
		queriesRepository,
	}),
};

export const poemsQueriesRouter = createPoemsQueriesRouter(
	queriesRouterServices,
);

export const poemsCommandsRouter = createPoemsCommandsRouter(
	commandsRouterServices,
);
