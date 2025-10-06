import fs from "node:fs";
import { pipeline } from "node:stream/promises";

import { parse } from "csv-parse";

import { getDB } from "../../__shared__/infrastructure/db";

export async function importOrders(filePath: string): Promise<void> {
	const prisma = getDB();
	console.log(`Starting import from file: ${filePath}`);

	const parser = parse({ delimiter: ";", from_line: 2 });

	let rowCount = 0;

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
}
