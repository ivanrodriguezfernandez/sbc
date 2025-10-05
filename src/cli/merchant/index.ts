import { importMerchants } from "./merchantImporter";

// npm run importMerchants -- filePath="./src/cli/merchants.csv"
function main() {
	const filePath = process.argv.find((a) => a.startsWith("filePath="))?.split("=")[1];
	if (filePath === undefined) throw new Error("Missing filePath argument");

	void importMerchants(filePath);
}

main();
