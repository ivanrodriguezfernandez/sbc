import { historicalDisbursementJob } from "./runHistoricalDisbursementJob";

async function main() {
	await historicalDisbursementJob();
}

void main();
