import fs from "node:fs";
import * as readline from "node:readline/promises";
import { pipeline } from "node:stream/promises";

import { PrismaClient } from "@prisma/client/extension";
import { Info, parse, Parser } from "csv-parse";
import { stringify } from "csv-stringify/sync";

import { getDB } from "../../__shared__/infrastructure/db";

const VALID_HEADERS = "id;merchant_reference;amount;created_at";
let processedRows: number;

type OrderRecord = {
	id: string;
	merchant_reference: string;
	amount: number | string;
	created_at: Date | string;
};

type RowError = {
	row: number;
	errors: Array<string>;
} & OrderRecord;

type ProcessedRowResult = RowError | undefined;

type Result = { errors: Array<RowError> };

const ERROR_MESSAGES = {
	InvalidColumnNames: "Invalid column names",
};

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

export async function importOrders(filePath: string): Promise<Result> {
	console.log(`Starting import from file: ${filePath}`);

	const prisma = getDB();

	const result: Result = await validateColumnHeaders(filePath);

	if (result.errors.length > 0) {
		await writeOutputCSV(result);
		return result;
	}

	const parser = parse({
		columns: true,
		delimiter: ";",
		skipRecordsWithEmptyValues: true,
		info: true,
		cast: true,
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
				// eslint-disable-next-line
				yield await processRow(chunk, prisma);
			} catch (error) {
				console.error(error);
				break;
			}
		}
	}

	await pipeline(fs.createReadStream(filePath), parser, processRowAsync, processRowResults);

	await writeOutputCSV(result);
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
) {
	const orderRecord = record;
	const HEADERS_ROW = 1;
	processedRows = info.records + HEADERS_ROW;

	const merchant = await prisma.merchant.findFirst({
		where: { reference: orderRecord.merchant_reference },
	});

	await prisma.order.create({
		data: {
			externalId: orderRecord.id,
			merchantId: merchant.id,
			amount: orderRecord.amount,
			transactionDate: new Date(orderRecord.created_at),
		},
	});

	console.log("processedRows", processedRows);
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
