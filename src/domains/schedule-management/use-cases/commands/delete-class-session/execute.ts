import { NotFoundError } from '@DomainError';
import type {
	DeleteClassSessionParams,
	ScheduleCommandsRepository,
} from '../../../ports/commands';
import type { ClassSession } from '../../../ports/models';
import { assertCanDeleteClassSession } from './policies';

type Dependencies = {
	commandsRepository: ScheduleCommandsRepository;
};

export function deleteClassSessionFactory({
	commandsRepository,
}: Dependencies) {
	return async function deleteClassSession(
		params: DeleteClassSessionParams,
	): Promise<ClassSession> {
		assertCanDeleteClassSession({
			actorRole: params.actorRole,
			actorStatus: params.actorStatus,
		});

		const existingClassSession =
			await commandsRepository.selectClassSessionById(params.classSessionId);

		if (!existingClassSession) {
			throw new NotFoundError('Class session not found');
		}

		const result = await commandsRepository.deleteClassSession(
			params.classSessionId,
		);

		if (result.ok) return result.data;
		throw new NotFoundError('Class session not found');
	};
}
