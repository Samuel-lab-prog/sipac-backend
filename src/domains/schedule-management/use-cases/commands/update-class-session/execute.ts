import { NotFoundError, UnknownError } from '@DomainError';
import type { UpdateClassSessionParams } from '../../../ports/commands';
import type { ClassSession } from '../../../ports/models';

interface Dependencies {
	commandsRepository: {
		selectClassSessionById(
			classSessionId: number,
		): Promise<ClassSession | null>;
		updateClassSession(
			params: UpdateClassSessionParams,
		): Promise<import('@SharedKernel/types').CommandResult<ClassSession>>;
	};
}

export function updateClassSessionFactory({
	commandsRepository,
}: Dependencies) {
	return async function updateClassSession(
		params: UpdateClassSessionParams,
	): Promise<ClassSession> {
		const current = await commandsRepository.selectClassSessionById(
			params.classSessionId,
		);
		if (!current) throw new NotFoundError('Class session not found');

		const result = await commandsRepository.updateClassSession(params);
		if (result.ok) return result.data;
		throw new UnknownError('Failed to update class session');
	};
}
