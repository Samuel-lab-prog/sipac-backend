import type { Announcement } from '../../../ports/models';
import type {
	CommunicationsCommandsRepository,
	CreateAnnouncementParams,
} from '../../../ports/queries';
import { assertCanManageAnnouncements } from '../policies';

type Dependencies = {
	commandsRepository: CommunicationsCommandsRepository;
};

export function createAnnouncementFactory({
	commandsRepository,
}: Dependencies) {
	return function createAnnouncement(
		params: CreateAnnouncementParams,
	): Promise<Announcement> {
		assertCanManageAnnouncements(params.actorRole);
		return commandsRepository.createAnnouncement(params);
	};
}
