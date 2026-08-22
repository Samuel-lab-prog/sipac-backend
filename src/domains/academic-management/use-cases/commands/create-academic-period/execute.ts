import { ConflictError, UnknownError } from '@DomainError';
import type { CreateAcademicPeriodParams } from '../../../ports/commands';
import type { AcademicPeriod } from '../../../ports/models';

interface Dependencies {
	commandsRepository: {
		createAcademicPeriod(
			params: CreateAcademicPeriodParams,
		): Promise<import('@SharedKernel/types').CommandResult<AcademicPeriod>>;
	};
}

export function createAcademicPeriodFactory({
	commandsRepository,
}: Dependencies) {
	return async function createAcademicPeriod(
		params: CreateAcademicPeriodParams,
	): Promise<AcademicPeriod> {
		const result = await commandsRepository.createAcademicPeriod(params);
		if (result.ok) return result.data;
		if (result.code === 'CONFLICT')
			throw new ConflictError(
				result.message ?? 'Academic period already exists',
			);
		throw new UnknownError(
			result.message ?? 'Failed to create academic period',
		);
	};
}
