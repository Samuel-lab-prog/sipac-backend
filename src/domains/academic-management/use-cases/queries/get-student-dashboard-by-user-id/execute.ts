import { NotFoundError } from '@DomainError';
import type { StudentDashboard } from '../../../ports/queries';

interface Dependencies {
	queriesRepository: {
		selectStudentDashboardByUserId(userId: number): Promise<StudentDashboard | null>;
	};
}

export function getStudentDashboardByUserIdFactory({ queriesRepository }: Dependencies) {
	return function getStudentDashboardByUserId(userId: number): Promise<StudentDashboard> {
		return queriesRepository.selectStudentDashboardByUserId(userId).then((dashboard) => {
			if (!dashboard) throw new NotFoundError('Student dashboard not found');
			return dashboard;
		});
	};
}
