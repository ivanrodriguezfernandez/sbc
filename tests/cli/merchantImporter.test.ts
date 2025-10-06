import path from "node:path";

import { PrismaClient } from "@prisma/client";
import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";

import { getDB } from "../../src/__shared__/infrastructure/db";
import { importMerchants } from "../../src/cli/merchant/merchantImporter";
import { setupTestDb } from "../config/setup";

const getFilePath = (filename: string) => path.join(__dirname, `./csvMocks/${filename}`);

let prisma: PrismaClient;
let container: StartedPostgreSqlContainer;

describe("Import merchant", () => {
	beforeAll(async () => {
		container = await setupTestDb();
		prisma = getDB();
	}, 60_000);

	afterAll(async () => {
		await prisma.$disconnect();
		await container.stop();
	});

	it("WHEN csv is imported THEN database is populated", async () => {
		const filePath = getFilePath("basic_merchant.csv");

		await importMerchants(filePath);

		const dataFromDb = await prisma.merchant.findMany({ orderBy: { reference: "asc" } });

		expect(dataFromDb).toStrictEqual([
			{
				id: "d1649242-a612-46ba-82d8-225542bb9576",
				reference: "deckow_gibson",
				email: "info@deckow-gibson.com",
				liveOn: new Date("2022-12-14T00:00:00.000Z"),
				disbursementFrequency: "DAILY",
				minimumMonthlyFee: 0.0,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
				deletedAt: null,
			},
			{
				id: "86312006-4d7e-45c4-9c28-788f4aa68a62",
				reference: "padberg_group",
				email: "info@padberg-group.com",
				liveOn: new Date("2023-02-01T00:00:00.000Z"),
				disbursementFrequency: "DAILY",
				minimumMonthlyFee: 0.0,
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
				deletedAt: null,
			},
		]);
	});

	it("WHEN csv is imported twice THEN existing merchants are updated, not duplicated", async () => {
		const filePath = getFilePath("basic_merchant.csv");

		await importMerchants(filePath);
		await importMerchants(filePath);

		const merchants = await prisma.merchant.findMany();

		expect(merchants).toHaveLength(2);
	});

	it("WHEN an existing merchant is reimported with updated data THEN fields are updated", async () => {
		const filePath = getFilePath("basic_merchant.csv");
		await importMerchants(filePath);

		const updatedFilePath = getFilePath("basic_merchant_updated.csv");
		await importMerchants(updatedFilePath);

		const merchant = await prisma.merchant.findFirst({ where: { reference: "deckow_gibson" } });

		expect(merchant?.email).toBe("new_email@deckow-gibson.com");
	});
});
