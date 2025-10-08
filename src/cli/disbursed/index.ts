import { calculate } from "@/src/cli/disbursed/disbursedCalculator";

// npm run disbursed"
function main() {
	// const filePath = process.argv.find((a) => a.startsWith("filePath="))?.split("=")[1];
	// if (filePath === undefined) throw new Error("Missing filePath argument");

	void calculate();
}

main();
