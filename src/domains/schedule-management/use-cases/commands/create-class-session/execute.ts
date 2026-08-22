import { ConflictError, UnknownError } from '@DomainError';
import type { CreateClassSessionParams } from '../../../ports/commands';
import type { ClassSession } from '../../../ports/models';

interface Dependencies {
	commandsRepository: {
		selectClassSessionsByClassOfferingId(
			classOfferingId: number,
		): Promise<ClassSession[]>;
		createClassSession(
			params: CreateClassSessionParams,
		): Promise<import('@SharedKernel/types').CommandResult<ClassSession>>;
	};
}

export function createClassSessionFactory({
	commandsRepository,
}: Dependencies) {
	return async function createClassSession(
		params: CreateClassSessionParams,
	): Promise<ClassSession> {
		const existingSessions =
			await commandsRepository.selectClassSessionsByClassOfferingId(
				params.classOfferingId,
			);
		if (
			existingSessions.some(
				(session) => session.startsAt.getTime() === params.startsAt.getTime(),
			)
		) {
			throw new ConflictError(
				'Class session already exists at this start time',
			);
		}

		const result = await commandsRepository.createClassSession(params);
		if (result.ok) return result.data;
		throw new UnknownError(result.message ?? 'Failed to create class session');
	};
}
