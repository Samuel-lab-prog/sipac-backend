export const ADR = {
	domainStructure: 'ADR-01.001',
	fanOutLimits: 'ADR-01.002',
	orchestrationBoundaries: 'ADR-02.001',
	changeAmplification: 'ADR-01.003',
	domainIsolation: 'ADR-02.002',
	useCaseTests: 'ADR-03.001',
	domainTests: 'ADR-03.002',
	domainSize: 'ADR-01.004',
	mainSequenceDistance: 'ADR-01.005',
	noCrossDomainCalls: 'ADR-02.003',
	rootNamespaces: 'ADR-02.004',
	noRootSourceCode: 'ADR-02.005',
	directionalDependencies: 'ADR-02.006',
	mandatoryDomainFolders: 'ADR-01.006',
	circularDependencies: 'ADR-02.007',
	linting: 'ADR-04.001',
	useCaseDependenciesPrivate: 'ADR-04.005',
	useCaseFactorySignature: 'ADR-04.006',
	useCaseDomainErrorAlias: 'ADR-04.007',
	useCaseFolderNames: 'ADR-04.008',
	architecturalMetrics: 'ADR-05.001',
} as const;

export type Adr = (typeof ADR)[keyof typeof ADR];

export function withAdr(label: string, ...adrs: Adr[]): string {
	return `${label} (${adrs.join(', ')})`;
}
