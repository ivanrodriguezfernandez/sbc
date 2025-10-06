import fs from "node:fs";
import * as readline from "node:readline/promises";
import { pipeline } from "node:stream/promises";

import { parse } from "csv-parse";
import { stringify } from "csv-stringify/sync";

import { getDB } from "../../__shared__/infrastructure/db";

const VALID_HEADERS = "id;merchant_reference;amount;created_at";

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
	const prisma = getDB();
	console.log(`Starting import from file: ${filePath}`);

	const parser = parse({ delimiter: ";", from_line: 2 });

	let rowCount = 0;

	const result: Result = await validateColumnHeaders(filePath);

	if (result.errors.length > 0) {
		await writeOutputCSV(result);
		return result;
	}

	parser.on("data", async (csvrow) => {
		rowCount++;

		const externalId = String(csvrow[0]);
		const merchantReference = csvrow[1];
		const amount = Number(csvrow[2]);
		const transactionDate = new Date(csvrow[3]);

		const merchant = await prisma.merchant.findFirst({ where: { reference: merchantReference } });

		await prisma.order.create({
			data: { externalId, merchantId: merchant.id, amount, transactionDate },
		});

		console.log(`Processing row ${rowCount}: ${externalId}`);
	});

	await pipeline(fs.createReadStream(filePath), parser);

	console.log(`Import finished! Total rows processed: ${rowCount}`);
	return;
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
