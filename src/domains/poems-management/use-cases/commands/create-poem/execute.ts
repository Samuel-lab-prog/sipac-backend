import type { SlugService } from '../../../ports/externalServices';
import type {
	CommandsRepository,
	CreatePoemParams,
} from '../../../ports/commands';
import type { CreatePoemDB, CreatePoemResult } from '../../../ports/models';
import { canCreatePoem } from '../../policies/Policies';
import type { UsersPublicContract } from '@Domains/users-management/public/Index';
import { ConflictError } from '@DomainError';

interface Dependencies {
	commandsRepository: CommandsRepository;
	slugService: SlugService;
	usersContract: UsersPublicContract;
}

export function createPoemFactory(deps: Dependencies) {
	const { commandsRepository, slugService, usersContract } = deps;
	return async function createPoem(
		params: CreatePoemParams,
	): Promise<CreatePoemResult> {
		const { data, meta } = params;
		const authorCtx = {
			id: meta.requesterId,
			status: meta.requesterStatus,
			role: meta.requesterRole,
		};
		await canCreatePoem({
			ctx: {
				author: authorCtx,
			},
			usersContract,
			toUserIds: data.toUserIds,
			mentionedUserIds: data.mentionedUserIds,
		});
		const status = data.status ?? 'draft';
		const canAutoApprove =
			meta.requesterRole === 'admin' || meta.requesterRole === 'moderator';
		const moderationStatus: CreatePoemResult['moderationStatus'] =
			status === 'published'
				? canAutoApprove
					? 'approved'
					: 'pending'
				: 'approved';
		const slug = slugService.generateSlug(data.title);
		const poem: CreatePoemDB = {
			...data,
			status,
			moderationStatus,
			slug,
			authorId: meta.requesterId,
		};

		const result = await commandsRepository.insertPoem(poem);
		if (result.ok === true) return result.data;

		if (result.ok === false && result.code === 'CONFLICT')
			throw new ConflictError(
				'Another poem with the same title already exists',
			);

		throw result.error;
	};
}
