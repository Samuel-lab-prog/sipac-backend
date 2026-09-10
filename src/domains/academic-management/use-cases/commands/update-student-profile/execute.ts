import {
	ConflictError,
	ForbiddenError,
	NotFoundError,
	UnknownError,
} from '@DomainError';
import type { UpdateStudentProfileParams } from '../../../ports/commands';
import type { StudentProfile } from '../../../ports/models';
import { assertCanUpdateStudentProfile } from '../policies';
import { prisma } from '@Prisma';
import { BcryptHashService } from '@SharedKernel/infra/encrypting/bcrypt';

interface Dependencies {
	commandsRepository: {
		updateStudentProfile(
			userId: number,
			params: Partial<import('../../../ports/models').StudentProfile>,
		): Promise<import('@SharedKernel/types').CommandResult<StudentProfile>>;
	};
}

export function updateStudentProfileFactory({
	commandsRepository,
}: Dependencies) {
	return async function updateStudentProfile(
		params: UpdateStudentProfileParams,
	): Promise<StudentProfile> {
		assertCanUpdateStudentProfile({
			actorId: params.actorId,
			actorRole: params.actorRole,
			actorStatus: params.actorStatus,
			targetUserId: params.targetUserId,
		});
		const user = params.currentPassword
			? await prisma.user.findUnique({
					where: { id: params.actorId },
					select: { passwordHash: true },
				})
			: null;
		if (
			params.currentPassword &&
			(!user ||
				!(await BcryptHashService.compare(
					params.currentPassword,
					user.passwordHash,
				)))
		) {
			throw new ForbiddenError('Current password does not match');
		}
		if (params.birthDate && params.birthDate > new Date()) {
			throw new ForbiddenError('Birth date cannot be in the future');
		}
		const {
			currentPassword: _currentPassword,
			actorId: _actorId,
			actorRole: _actorRole,
			actorStatus: _actorStatus,
			targetUserId: _targetUserId,
			userId: _userId,
			academicId: _academicId,
			courseId: _courseId,
			admissionYear: _admissionYear,
			status: _status,
			birthDate: _birthDate,
			gender: _gender,
			birthCountry: _birthCountry,
			fatherName: _fatherName,
			motherName: _motherName,
			nationality: _nationality,
			birthplace: _birthplace,
			rgIssueDate: _rgIssueDate,
			rgIssuer: _rgIssuer,
			rgState: _rgState,
			electoralTitle: _electoralTitle,
			electoralZone: _electoralZone,
			electoralSection: _electoralSection,
			militaryCertificate: _militaryCertificate,
			documentSeries: _documentSeries,
			...editableData
		} = params;
		const result = await commandsRepository.updateStudentProfile(
			params.targetUserId,
			Object.fromEntries(
				Object.entries(editableData).filter(([, value]) => value !== undefined),
			),
		);
		if (result.ok) return result.data;
		if (result.code === 'NOT_FOUND')
			throw new NotFoundError('Student profile not found');
		if (result.code === 'CONFLICT')
			throw new ConflictError(
				result.message ?? 'Student profile already exists',
			);
		throw new UnknownError(
			result.message ?? 'Failed to update student profile',
		);
	};
}
