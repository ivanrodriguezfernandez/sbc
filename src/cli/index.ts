import { importMerchants } from "./merchantImporter";

// npm run importMerchants -- filePath="./src/cli/merchants.csv"
function main() {
	const args = process.argv.reduce(
		(args, arg) => {
			const [key, value] = arg.split("=");
			if (key !== undefined) {
				args[key] = value ?? "";
			}
			return args;
		},
		{} as Record<string, string>,
	);

	if (args.filePath === undefined) {
		console.error(`Missing required filePath=undefined`);
	} else {
		void importMerchants(args.filePath);
	}
}

main();
