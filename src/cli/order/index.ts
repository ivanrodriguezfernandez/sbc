import { importOrders } from "./orderImporter";

// npm run importOrders -- filePath="./src/cli/orders.csv"
function main() {
	const filePath = process.argv.find((a) => a.startsWith("filePath="))?.split("=")[1];
	if (filePath === undefined) throw new Error("Missing filePath argument");

	void importOrders(filePath);
}

main();
