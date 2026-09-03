import { commandsRepository } from './infra/commands-repository/repository';
import { createActivitiesCommandsRouter } from './adapters/commands-router';
import { createActivitiesQueriesRouter } from './adapters/queries-router';
import { createAcademicActivityFactory } from './use-cases/commands/create-academic-activity/execute';
import { createAcademicActivitySubmissionFactory } from './use-cases/commands/create-academic-activity-submission/execute';
import { createAcademicActivitySubmissionUploadUrlFactory } from './use-cases/commands/create-academic-activity-submission-upload-url/execute';
import { storageService } from '@SharedKernel/infra/storage/storage-service';

const createAcademicActivity = createAcademicActivityFactory({
	commandsRepository,
});
const createAcademicActivitySubmission =
	createAcademicActivitySubmissionFactory({ commandsRepository });
const createAcademicActivitySubmissionUploadUrl =
	createAcademicActivitySubmissionUploadUrlFactory({ storageService });

export const activitiesCommandsRouter = createActivitiesCommandsRouter({
	createAcademicActivity,
	createAcademicActivitySubmission,
	createAcademicActivitySubmissionUploadUrl,
});

export const activitiesQueriesRouter = createActivitiesQueriesRouter({
	listAcademicActivitiesByClassOfferingId(classOfferingId) {
		return commandsRepository.selectAcademicActivitiesByClassOfferingId(
			classOfferingId,
		);
	},
	listAcademicActivitySubmissionsByStudentProfileId(studentProfileId) {
		return commandsRepository.selectAcademicActivitySubmissionsByStudentProfileId(
			studentProfileId,
		);
	},
});
