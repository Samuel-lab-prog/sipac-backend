import { appErrorSchema } from '@AppError';
import { authPlugin } from '@GenericSubdomains/authentication/composition';

import { Elysia, t } from 'elysia';

import { idSchema } from '@SharedKernel/Schemas';
import { type CommandsRouterServices } from '../ports/commands';
import {
	BlockedUserSchema,
	CancelFriendRequestSchema,
	FriendRecordSchema,
	FriendRequestRejectionSchema,
	FriendRequestSchema,
	RemovedFriendSchema,
	UnblockUserSchema,
} from '../ports/schemas/Index';

export function createFriendsCommandsRouter(services: CommandsRouterServices) {
	return new Elysia({ prefix: '/friends' })
		.use(authPlugin)
		.post(
			'/:id',
			async ({ auth, params, set }) => {
				const result = await services.sendFriendRequest({
					requesterId: auth.clientId,
					addresseeId: params.id,
				});
				set.status = 201;
				return result;
			},
			{
				response: {
					201: FriendRequestSchema,
					409: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				status: 201,
				detail: {
					summary: 'Send Friend Request',
					description:
						'Sends a friend request from the authenticated user to the target user.',
					tags: ['Friends Management'],
				},
			},
		)
		.patch(
			'/accept/:id',
			({ auth, params }) => {
				return services.acceptFriendRequest({
					requesterId: params.id,
					addresseeId: auth.clientId,
				});
			},
			{
				response: {
					200: t.Union([FriendRecordSchema, FriendRequestSchema]),
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				status: 200,
				detail: {
					summary: 'Accept Friend Request',
					description:
						'Accepts a friend request from the specified user to the authenticated user.',
					tags: ['Friends Management'],
				},
			},
		)
		.patch(
			'/reject/:id',
			({ auth, params }) => {
				return services.rejectFriendRequest({
					requesterId: params.id,
					addresseeId: auth.clientId,
				});
			},
			{
				response: {
					200: FriendRequestRejectionSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				status: 200,
				detail: {
					summary: 'Reject Friend Request',
					description:
						'Rejects a friend request from the specified user to the authenticated user.',
					tags: ['Friends Management'],
				},
			},
		)
		.patch(
			'/block/:id',
			({ auth, params }) => {
				return services.blockUser({
					requesterId: auth.clientId,
					addresseeId: params.id,
				});
			},
			{
				response: {
					200: BlockedUserSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				status: 200,
				detail: {
					summary: 'Block User',
					description: 'Blocks a user for the authenticated user.',
					tags: ['Friends Management'],
				},
			},
		)
		.delete(
			'/delete/:id',
			({ auth, params }) => {
				return services.deleteFriend({
					requesterId: auth.clientId,
					addresseeId: params.id,
				});
			},
			{
				response: {
					200: RemovedFriendSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				status: 200,
				detail: {
					summary: 'Delete Friend',
					description:
						'Deletes the friendship between the authenticated user and the specified user.',
					tags: ['Friends Management'],
				},
			},
		)
		.delete(
			'/cancel/:id',
			({ auth, params }) => {
				return services.cancelFriendRequest({
					requesterId: auth.clientId,
					addresseeId: params.id,
				});
			},
			{
				response: {
					200: CancelFriendRequestSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				detail: {
					summary: 'Cancel Friend Request',
					description:
						'Cancels a previously sent friend request from the authenticated user to the specified user.',
					tags: ['Friends Management'],
				},
			},
		)
		.patch(
			'/unblock/:id',
			({ auth, params }) => {
				return services.unblockUser({
					requesterId: auth.clientId,
					addresseeId: params.id,
				});
			},
			{
				response: {
					200: UnblockUserSchema,
					404: appErrorSchema,
				},
				params: t.Object({
					id: idSchema,
				}),
				detail: {
					summary: 'Unblock User',
					description:
						'Unblocks a previously blocked user for the authenticated user.',
					tags: ['Friends Management'],
				},
			},
		);
}
