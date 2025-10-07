import fs from "node:fs";
import * as readline from "node:readline/promises";

import { parse } from "csv-parse";

import { getDB } from "../../__shared__/infrastructure/db";
import { logger } from "../../__shared__/infrastructure/logger";

const BATCH_SIZE = 1000;

const ERROR_MESSAGES = {
	InvalidColumnNames: "Invalid column names",
	MerchantReferenceMandatory: "merchant_reference is mandatory",
};

type OrderRecord = {
	id: string;
	merchant_reference: string;
	amount: string;
	created_at: string;
};

type RowError = OrderRecord & { row: number; errors: string[] };

type OrderToInsert = {
	externalId: string;
	merchantId: string;
	amount: number;
	transactionDate: Date;
};

export async function importOrders(filePath: string): Promise<void> {
	console.time("Execution Time");
	logger.info(`Starting import from file: ${filePath}`);

	const result = await validateColumnHeaders(filePath);

	if (!result.isValid) {
		await writeOutputCSV(result.output);
		return;
	}

	const merchansts = await getMerchantsMap();

	let buffer: OrderToInsert[] = [];
	let rowNumber = 0;
	const importErrors: string[] = [];

	const prisma = getDB();

	const parser = fs
		.createReadStream(filePath)
		.pipe(parse({ delimiter: ";", columns: true, skip_empty_lines: true }));

	for await (const record of parser) {
		rowNumber++;

		if (record.merchant_reference === "") {
			const error =
				Number(rowNumber + 1) +
				";" +
				record.id +
				";" +
				record.merchant_reference +
				";" +
				record.amount +
				";" +
				record.created_at +
				";" +
				ERROR_MESSAGES.MerchantReferenceMandatory;

			importErrors.push(error);
		} else {
			const merchantId = merchansts.get(record.merchant_reference);
			buffer.push({
				externalId: record.id,
				merchantId,
				amount: Number(record.amount),
				transactionDate: new Date(record.created_at),
			});

			if (buffer.length >= BATCH_SIZE) {
				await prisma.order.createMany({ data: buffer, skipDuplicates: true });
				buffer = [];
			}
		}

		if (rowNumber % 10000 === 0) logger.info(`${rowNumber} rows processed`);
	}

	if (buffer.length > 0) {
		await prisma.order.createMany({ data: buffer, skipDuplicates: true });
	}

	importErrors.unshift("row;id;merchant_reference;amount;created_at;errors");
	console.log("final resultado", importErrors);
	await writeOutputCSV(importErrors.join("\n") + "\n");
}

async function validateColumnHeaders(
	filePath: string,
): Promise<{ isValid: boolean; output: string }> {
	const HEADERS = "id;merchant_reference;amount;created_at";

	const firstLine = await getFirstLine(filePath);

	if (HEADERS !== firstLine) {
		logger.error("Invalid CSV headers, aborting import.");
		return {
			isValid: false,
			output: `row;${HEADERS};errors\n0;;;;;${ERROR_MESSAGES.InvalidColumnNames}\n`,
		};
	}
	return { isValid: true, output: "" };
}

async function writeOutputCSV(output: string) {
	if (!fs.existsSync("./importReport")) {
		fs.mkdirSync("./importReport");
	}

	fs.writeFileSync("./importReport/report.csv", output);
}

async function getFirstLine(filePath: string): Promise<string> {
	const readable = fs.createReadStream(filePath);
	const reader = readline.createInterface({ input: readable });
	const line: string = await new Promise((resolve) => {
		reader.on("line", (line) => {
			reader.close();
			resolve(line);
		});
	});
	readable.close();
	return line;
}
async function getMerchantsMap() {
	const prisma = getDB();
	console.time("Load merchants");
	const merchants = await prisma.merchant.findMany({ select: { id: true, reference: true } });
	const merchantMap = new Map(merchants.map((m) => [m.reference, m.id]));
	console.timeEnd("Load merchants");
	logger.info(`Loaded ${merchantMap.size} merchants`);
	return merchantMap;
}
