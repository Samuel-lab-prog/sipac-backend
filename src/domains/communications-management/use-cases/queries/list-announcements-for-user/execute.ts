import type {
	AnnouncementListItem,
	CommunicationsQueriesRepository,
} from '../../../ports/queries';

type Dependencies = {
	queriesRepository: CommunicationsQueriesRepository;
};

export function listAnnouncementsForUserFactory({
	queriesRepository,
}: Dependencies) {
	return function listAnnouncementsForUser(
		userId: number,
		role: 'student' | 'professor' | 'staff' | 'admin',
	): Promise<AnnouncementListItem[]> {
		return queriesRepository.listAnnouncementsForUser(userId, role);
	};
}
