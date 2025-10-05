import fs from "node:fs";
import { pipeline } from "node:stream/promises";

import { parse } from "csv-parse";

import { Merchant } from "@/src/merchant/domain/merchant";

import { getDB } from "../../__shared__/infrastructure/db";

export async function importMerchants(filePath: string): Promise<void> {
	const prisma = getDB();
	console.log(`Starting import from file: ${filePath}`);

	const parser = parse({ delimiter: ";", from_line: 2 });
	const insertPromises: Promise<Merchant>[] = [];

	let rowCount = 0;

	parser.on("data", (csvrow) => {
		rowCount++;

		const data = {
			id: csvrow[0],
			reference: csvrow[1],
			email: csvrow[2],
			liveOn: new Date(csvrow[3]),
			disbursementFrequency: csvrow[4],
			minimumMonthlyFee: Number(csvrow[5]),
		};
		console.log(`Processing row ${rowCount}: ${data.reference}`);

		insertPromises.push(
			prisma.merchant.upsert({
				where: {
					id_reference_email: {
						id: data.id,
						reference: data.reference,
						email: data.email,
					},
				},
				update: {
					email: data.email,
					liveOn: data.liveOn,
					disbursementFrequency: data.disbursementFrequency,
					minimumMonthlyFee: data.minimumMonthlyFee,
				},
				create: data,
			}),
		);
	});

	await pipeline(fs.createReadStream(filePath), parser);

	await Promise.all(insertPromises);
	console.log(`Import finished! Total rows processed: ${rowCount}`);
}
