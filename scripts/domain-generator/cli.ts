import { createDomain } from './create-domain';

type CliArgs = {
	domainName?: string;
	dryRun: boolean;
	force: boolean;
};

function parseArgs(argv: string[]): CliArgs {
	const positional = argv.filter((arg) => !arg.startsWith('--'));
	return {
		domainName: positional[0],
		dryRun: argv.includes('--dry-run'),
		force: argv.includes('--force'),
	};
}

function printHelp() {
	console.log(`Usage:
  bun scripts/domain-generator/cli.ts <domain-name> [--dry-run] [--force]

Examples:
  bun scripts/domain-generator/cli.ts billing
  bun scripts/domain-generator/cli.ts billing-engine --dry-run
  bun scripts/domain-generator/cli.ts billing --force
`);
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	if (!args.domainName || args.domainName === '--help') {
		printHelp();
		process.exit(args.domainName ? 0 : 1);
	}

	try {
		const result = await createDomain({
			domainName: args.domainName,
			dryRun: args.dryRun,
			force: args.force,
		});

		console.log(
			`${result.dryRun ? 'Dry run' : 'Done'}: domain "${result.domainSlug}" at ${result.domainRoot}`,
		);
		console.log(`Files: ${result.createdFiles.length}`);
		for (const file of result.createdFiles) {
			console.log(`- ${file}`);
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`Error: ${message}`);
		process.exit(1);
	}
}

await main();
