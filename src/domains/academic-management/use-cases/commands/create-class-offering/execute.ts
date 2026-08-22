import { ConflictError, UnknownError } from '@DomainError';
import type { CreateClassOfferingParams } from '../../../ports/commands';
import type { ClassOffering } from '../../../ports/models';

interface Dependencies {
	commandsRepository: {
		createClassOffering(
			params: CreateClassOfferingParams,
		): Promise<import('@SharedKernel/types').CommandResult<ClassOffering>>;
	};
}

export function createClassOfferingFactory({
	commandsRepository,
}: Dependencies) {
	return async function createClassOffering(
		params: CreateClassOfferingParams,
	): Promise<ClassOffering> {
		const result = await commandsRepository.createClassOffering(params);
		if (result.ok) return result.data;
		if (result.code === 'CONFLICT')
			throw new ConflictError(
				result.message ?? 'Class offering already exists',
			);
		throw new UnknownError(result.message ?? 'Failed to create class offering');
	};
}
