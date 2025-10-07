import fs from "node:fs";
import * as readline from "node:readline/promises";

import { PrismaClient } from "@prisma/client/extension";
import { parse } from "csv-parse";

import { getDB } from "../../__shared__/infrastructure/db";
import { logger } from "../../__shared__/infrastructure/logger";

const BATCH_SIZE = 1000;
const HEADERS = "id;merchant_reference;amount;created_at";

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
let buffer: OrderToInsert[] = [];

export async function importOrders(filePath: string): Promise<void> {
	logger.info(`Starting import from file: ${filePath}`);
	console.time("Execution Time");

	const result = await validateColumnHeaders(filePath);

	if (!result.isValid) {
		await writeOutputCSV(result.output);
		return;
	}

	const merchansts = await getMerchantsMap();

	const parser = fs
		.createReadStream(filePath)
		.pipe(parse({ delimiter: ";", columns: true, skip_empty_lines: true }));

	let rowNumber = 0;
	const errors: RowError[] = [];
	const prisma = getDB();

	for await (const record of parser) {
		rowNumber++;
		const rowError = await processRow(record, merchansts, rowNumber, prisma);
		if (rowError) {
			errors.push(rowError);
		}
	}

	if (buffer.length > 0) {
		await prisma.order.createMany({ data: buffer, skipDuplicates: true });
	}

	if (errors.length > 0) {
		let output = `row;${HEADERS};errors\n`;
		for (const e of errors) {
			output += `${e.row};${e.id};${e.merchant_reference};${e.amount};${e.created_at};${e.errors.join(",")}\n`;
		}
		await writeOutputCSV(output);
	}

	console.timeEnd("Execution Time");
}

async function processRow(
	record: OrderRecord,
	merchants: Map<string, string>,
	rowNumber: number,
	prisma: PrismaClient,
) {
	const errors = [];
	const orderRecord = record;
	const HEADERS_ROW = 1;
	const row = rowNumber + HEADERS_ROW;

	if (record.merchant_reference === "") {
		errors.push(ERROR_MESSAGES.MerchantReferenceMandatory);
	}

	if (errors.length > 0) {
		const result = { row, ...orderRecord, errors };
		return result;
	}
	const merchantId = merchants.get(record.merchant_reference);
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

	if (rowNumber % 10000 === 0) logger.info(`${rowNumber} rows processed`);
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
async function getMerchantsMap(): Promise<Map<string, string>> {
	const prisma = getDB();
	console.time("Load merchants");
	const merchants = await prisma.merchant.findMany({ select: { id: true, reference: true } });
	const merchantMap = new Map(merchants.map((m) => [m.reference, m.id]));
	console.timeEnd("Load merchants");
	logger.info(`Loaded ${merchantMap.size} merchants`);
	return merchantMap;
}
