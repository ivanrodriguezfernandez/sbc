import { processDaily } from "./runHistoricalDisbursementJob";

async function main() {
	await processDaily();
}

void main();
