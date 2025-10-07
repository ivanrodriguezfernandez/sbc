import fs from "node:fs";

import { parse } from "csv-parse";

import { getDB } from "../../__shared__/infrastructure/db";
import { logger } from "../../__shared__/infrastructure/logger";

const BATCH_SIZE = 1000;
const HEADERS = "id;merchant_reference;amount;created_at";

const ERROR_MESSAGES = {
	InvalidCSVHeaders: "Invalid CSV headers",
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
	logger.info(`Starting import from file: ${filePath}`);
	console.time("Execution Time");

	await validateCSVHeaders(filePath);

	let buffer: OrderToInsert[] = [];

	const parser = fs.createReadStream(filePath).pipe(
		parse({
			delimiter: ";",
			skip_empty_lines: true,
			columns: true,
		}),
	);

	let rowNumber = 0;
	const errors: RowError[] = [];
	const prisma = getDB();
	const merchants = await getMerchantsMap();

	for await (const record of parser) {
		rowNumber++;
		const result = await validateRow(record, rowNumber);
		if (!result.isSuccess) {
			errors.push(result.rowError as RowError);
			continue;
		}

		buffer.push({
			externalId: record.id,
			merchantId: merchants.get(record.merchant_reference),
			amount: Number(record.amount),
			transactionDate: new Date(record.created_at),
		});

		if (buffer.length >= BATCH_SIZE) {
			await prisma.order.createMany({ data: buffer, skipDuplicates: true });
			buffer = [];
		}
		if (rowNumber % 10000 === 0) logger.info(`${rowNumber} rows processed`);
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

type ValidateRowResult = { isSuccess: boolean; rowError: RowError | null };

async function validateRow(record: OrderRecord, rowNumber: number): Promise<ValidateRowResult> {
	const errors = [];
	const orderRecord = record;
	const HEADERS_ROW = 1;
	const row = rowNumber + HEADERS_ROW;

	if (record.merchant_reference === "") {
		errors.push(ERROR_MESSAGES.MerchantReferenceMandatory);
	}

	if (errors.length > 0) {
		const result = { row, ...orderRecord, errors };
		return { isSuccess: false, rowError: result };
	}
	return { isSuccess: true, rowError: null };
}

async function writeOutputCSV(output: string) {
	if (!fs.existsSync("./importReport")) {
		fs.mkdirSync("./importReport");
	}

	fs.writeFileSync("./importReport/report.csv", output);
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

async function validateCSVHeaders(filePath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		const expectedHeaders = ["id", "merchant_reference", "amount", "created_at"];

		const stream = fs.createReadStream(filePath);
		const parser = stream.pipe(
			parse({
				delimiter: ";",
				to_line: 1,
			}),
		);

		parser.on("data", (row) => {
			const normalizedHeaders = row.map((h: string) => h.trim());
			const invalid = expectedHeaders.some((expected, i) => expected !== normalizedHeaders[i]);
			if (invalid) {
				reject(new Error(ERROR_MESSAGES.InvalidCSVHeaders));
			} else {
				resolve();
			}
		});

		parser.on("error", reject);
		parser.on("end", () => {
			resolve();
		});
	});
}
