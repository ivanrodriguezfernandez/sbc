import fs from "node:fs";
import { pipeline } from "node:stream/promises";

import { parse } from "csv-parse";

import { Merchant } from "@/src/merchants/domain/merchant";

import { getDB } from "../__shared__/infrastructure/db";

export async function importMerchants(filePath: string): Promise<void> {
	const prisma = getDB();

	const parser = parse({ delimiter: ";", from_line: 2 });
	const insertPromises: Promise<Merchant>[] = [];

	parser.on("data", (csvrow) => {
		const data = {
			id: csvrow[0],
			reference: csvrow[1],
			email: csvrow[2],
			liveOn: new Date(csvrow[3]),
			disbursementFrequency: csvrow[4],
			minimumMonthlyFee: Number(csvrow[5]),
		};

		insertPromises.push(prisma.merchant.create({ data }));
	});

	await pipeline(fs.createReadStream(filePath), parser);

	await Promise.all(insertPromises);
}
