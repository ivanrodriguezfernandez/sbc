import fs from "node:fs";
import * as readline from "node:readline/promises";
import { pipeline } from "node:stream/promises";

import { parse } from "csv-parse";

import { getDB } from "../../__shared__/infrastructure/db";

const VALID_HEADERS = "id;merchant_reference;amount;created_at";

export async function importOrders(filePath: string): Promise<void> {
	const prisma = getDB();
	console.log(`Starting import from file: ${filePath}`);

	const parser = parse({ delimiter: ";", from_line: 2 });

	let rowCount = 0;

	const firstLine = await getFirstLine(filePath);
	if (firstLine !== VALID_HEADERS) {
		const output =
			"row;id;merchant_reference;amount;created_at;errors\n" + "0;;;;;Invalid column names\n";

		if (!fs.existsSync("./importReport")) {
			fs.mkdirSync("./importReport");
		}

		fs.writeFileSync("./importReport/report.csv", output);
		return;
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
