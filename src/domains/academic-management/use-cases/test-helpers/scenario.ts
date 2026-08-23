import { makeSut } from '@GenericSubdomains/utils/testing/utils';
import type { AcademicQueriesRepository } from '../../ports/queries';
import { getProfessorProfileByUserIdFactory } from '../queries/get-professor-profile-by-user-id/execute';
import { getStaffProfileByUserIdFactory } from '../queries/get-staff-profile-by-user-id/execute';
import { getStudentProfileByUserIdFactory } from '../queries/get-student-profile-by-user-id/execute';
import {
	givenProfessorProfile,
	givenStaffProfile,
	givenStudentProfile,
} from './givens';
import { DEFAULT_USER_ID } from './constants';

function academicScenarioMockFactories() {
	return {
		queriesRepository: {
			selectStudentProfileByUserId: () => Promise.resolve(null),
			selectProfessorProfileByUserId: () => Promise.resolve(null),
			selectStaffProfileByUserId: () => Promise.resolve(null),
			selectStudentDashboardByUserId: () => Promise.resolve(null),
		} satisfies AcademicQueriesRepository,
	};
}

export function makeAcademicScenario() {
	const { sut, mocks } = makeSut(
		(m) => ({
			getStudentProfileByUserId: getStudentProfileByUserIdFactory({
				queriesRepository: m.queriesRepository,
			}),
			getProfessorProfileByUserId: getProfessorProfileByUserIdFactory({
				queriesRepository: m.queriesRepository,
			}),
			getStaffProfileByUserId: getStaffProfileByUserIdFactory({
				queriesRepository: m.queriesRepository,
			}),
		}),
		academicScenarioMockFactories(),
	);

	return {
		withStudentProfile(overrides = {}) {
			givenStudentProfile(mocks.queriesRepository, overrides);
			return this;
		},
		withProfessorProfile(overrides = {}) {
			givenProfessorProfile(mocks.queriesRepository, overrides);
			return this;
		},
		withStaffProfile(overrides = {}) {
			givenStaffProfile(mocks.queriesRepository, overrides);
			return this;
		},
		executeGetStudentProfile(userId = DEFAULT_USER_ID) {
			return sut.getStudentProfileByUserId(userId);
		},
		executeGetProfessorProfile(userId = DEFAULT_USER_ID) {
			return sut.getProfessorProfileByUserId(userId);
		},
		executeGetStaffProfile(userId = DEFAULT_USER_ID) {
			return sut.getStaffProfileByUserId(userId);
		},
		get mocks() {
			return mocks;
		},
	};
}
