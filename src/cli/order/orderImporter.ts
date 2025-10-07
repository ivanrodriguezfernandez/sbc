import fs from "node:fs";
import * as readline from "node:readline/promises";
import { pipeline } from "node:stream/promises";

import { PrismaClient } from "@prisma/client/extension";
import { Info, parse, Parser } from "csv-parse";
import { stringify } from "csv-stringify/sync";

import { getDB } from "../../__shared__/infrastructure/db";
import { logger } from "../../__shared__/infrastructure/logger";

const VALID_HEADERS = "id;merchant_reference;amount;created_at";
let processedRows: number;

type OrderRecord = {
	id: string;
	merchant_reference: string;
	amount: number | string;
	created_at: Date | string;
};

type RowError = { row: number; errors: Array<string> } & OrderRecord;
type ProcessedRowResult = RowError | undefined;
type Result = { errors: Array<RowError> };

const ERROR_MESSAGES = {
	InvalidColumnNames: "Invalid column names",
	MerchantReferenceMandatory: "merchant_reference is mandatory",
};

const BATCH_SIZE = 1000;
const orderBuffer: Array<{
	externalId: string;
	merchantId: string;
	amount: number | string;
	transactionDate: Date;
}> = [];

async function flushBatch(prisma: PrismaClient) {
	if (orderBuffer.length === 0) return;

	await prisma.order.createMany({ data: orderBuffer, skipDuplicates: true });
	orderBuffer.length = 0;
}

export async function importOrders(filePath: string): Promise<Result> {
	logger.info(`Starting import from file: ${filePath}`);
	console.time("Execution Time");

	const result: Result = await validateColumnHeaders(filePath);

	if (result.errors.length > 0) {
		await writeOutputCSV(result);
		return result;
	}

	const prisma = getDB();
	console.time("Load merchants");
	const merchants = await prisma.merchant.findMany({ select: { id: true, reference: true } });
	console.timeEnd("Load merchants");

	const merchantMap = new Map(merchants.map((m) => [m.reference, m.id]));
	logger.info(`Loaded ${merchantMap.size} merchants into memory`);

	const parser = parse({
		columns: true,
		delimiter: ";",
		skipRecordsWithEmptyValues: true,
		info: true,
		cast: false,
	});

	async function processRowResults(iterable: AsyncIterable<ProcessedRowResult>) {
		for await (const processedRowResult of iterable) {
			if (processedRowResult && processedRowResult.errors.length > 0) {
				result.errors.push(processedRowResult);
			}
		}
	}
	async function* processRowAsync(source: Parser) {
		for await (const chunk of source) {
			try {
				yield await processRow(chunk, prisma, merchantMap);
			} catch (error) {
				console.error(error);
				break;
			}
		}
	}

	await pipeline(fs.createReadStream(filePath), parser, processRowAsync, processRowResults);

	await flushBatch(prisma); // Make sure to flush the buffer at the end

	await writeOutputCSV(result);
	console.timeEnd("Execution Time");
	return result;
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

async function processRow(
	{ info, record }: { info: Info; record: OrderRecord },
	prisma: PrismaClient,
	merchantMap: Map<string, string>,
) {
	const errors = [];
	const orderRecord = record;
	const HEADERS_ROW = 1;
	const row = info.records + HEADERS_ROW;

	if (orderRecord.merchant_reference === "") {
		errors.push(ERROR_MESSAGES.MerchantReferenceMandatory);
	}

	if (errors.length > 0) {
		const result = { row, ...orderRecord, errors };
		return result;
	}

	const merchantId = merchantMap.get(orderRecord.merchant_reference);
	if (merchantId == undefined) {
		console.warn(`Merchant not found: ${orderRecord.merchant_reference}`);
		return;
	}

	orderBuffer.push({
		externalId: orderRecord.id,
		merchantId,
		amount: orderRecord.amount,
		transactionDate: new Date(orderRecord.created_at),
	});

	if (orderBuffer.length >= BATCH_SIZE) {
		await flushBatch(prisma);
	}

	if (row % 10000 === 0) {
		logger.info(row, "processedRows");
	}
}

async function writeOutputCSV(result: Result) {
	const formattedErrors = result.errors.map((error) => ({
		...error,
		errors: error.errors.join(" | "),
	}));

	const output = stringify(formattedErrors, { header: true, delimiter: ";" });

	if (!fs.existsSync("./importReport")) {
		fs.mkdirSync("./importReport");
	}
	fs.writeFileSync("./importReport/report.csv", output);
}

async function validateColumnHeaders(filePath: string): Promise<Result> {
	const result: Result = { errors: [] };
	const firstLine = await getFirstLine(filePath);
	if (firstLine !== VALID_HEADERS) {
		result.errors.push({
			row: 0,
			id: "",
			merchant_reference: "",
			amount: "",
			created_at: "",
			errors: [ERROR_MESSAGES.InvalidColumnNames],
		});
	}
	return result;
}
