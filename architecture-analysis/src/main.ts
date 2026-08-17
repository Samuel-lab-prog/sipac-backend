import { loadClocData, loadDepcruiseData } from './utils/Utils';

import {
	printChangeAmplification,
	printDomainIsolation,
	printDomainCodeStats,
	printDomainDrivenStructure,
	printMainSeqDist,
	printDomainStatistics,
	printEndpointAndUseCaseTotals,
	printNoCircularDependencies,
	printTopFanIn,
	printHotspotModules,
	printTopFanOut,
	printNoCrossDomainCalls,
	printNoUntestedUsecase,
	printNoInvalidRootNamespaces,
	printNoRootSourceCode,
	printNoInvalidDirectionalDependencies,
	printNoMissingDirectories,
	printNoInvalidInfraDirectory,
	printNoInvalidRepositoryFiles,
	printNoInvalidUseCaseFolders,
	printNoInvalidUseCaseFolderNames,
	printNoMissingUseCaseBarrels,
	printNoInvalidPortsContent,
	printNoMissingSchemaBarrels,
	printNoExportedUseCaseDependencies,
	printNoInvalidUseCaseFactories,
	printNoInvalidUseCaseErrorImports,
	printNoCaseMismatchImports,
} from './metrics/Index';

function metrics(): void {
	const depcruise = loadDepcruiseData();
	const cloc = loadClocData();

	printTopFanOut(depcruise);
	printTopFanIn(depcruise);
	printHotspotModules(depcruise, cloc);
	printDomainStatistics(cloc);
	printDomainIsolation(depcruise);
	printChangeAmplification();
	printMainSeqDist(cloc, depcruise);
	printDomainCodeStats(cloc);
	printEndpointAndUseCaseTotals(cloc);

	printDomainDrivenStructure(cloc);
	printNoCrossDomainCalls(depcruise);
	printNoCircularDependencies(depcruise);
	printNoInvalidRootNamespaces(depcruise);
	printNoRootSourceCode(depcruise);
	printNoInvalidDirectionalDependencies(depcruise);
	printNoUntestedUsecase(cloc);
	printNoMissingDirectories(cloc);
	printNoInvalidInfraDirectory(cloc);
	printNoInvalidRepositoryFiles(cloc);
	printNoInvalidUseCaseFolders(cloc);
	printNoInvalidUseCaseFolderNames(cloc);
	printNoMissingUseCaseBarrels(cloc);
	printNoExportedUseCaseDependencies(cloc);
	printNoInvalidUseCaseFactories(cloc);
	printNoInvalidUseCaseErrorImports(cloc);
	printNoInvalidPortsContent(cloc);
	printNoMissingSchemaBarrels(cloc);
	printNoCaseMismatchImports(cloc);
}

metrics();
