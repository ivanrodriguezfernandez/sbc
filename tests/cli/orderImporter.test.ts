import path from "node:path";

import {
	disbursementFrequencyType as prismaDisbursementFrequencyType,
	PrismaClient,
} from "@prisma/client";
import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { getDB } from "../../src/__shared__/infrastructure/db";
import { importOrders } from "../../src/cli/order/orderImporter";
import { setupTestDb } from "../config/setup";

const getFilePath = (filename: string) => path.join(__dirname, `./csvMocks/${filename}`);

let prisma: PrismaClient;
let container: StartedPostgreSqlContainer;

const DisbursementFrequencyType = prismaDisbursementFrequencyType;

describe("Import order", () => {
	beforeAll(async () => {
		container = await setupTestDb();
		prisma = getDB();
	}, 60_000);

	afterAll(async () => {
		await prisma.$disconnect();
		await container.stop();
	});

	it("WHEN csv is imported THEN database is populated", async () => {
		//todo: builder
		await prisma.merchant.create({
			data: {
				id: "86312006-4d7e-45c4-9c28-788f4aa68a62",
				reference: "padberg_group",
				email: "info@padberg-group.com",
				liveOn: new Date("2023-02-01T00:00:00.000Z"),
				disbursementFrequency: DisbursementFrequencyType.DAILY,
				minimumMonthlyFee: 0.0,
			},
		});

		const filePath = getFilePath("basic_orders.csv");

		await importOrders(filePath);

		const ordersFromDB = await prisma.order.findMany({ orderBy: { externalId: "asc" } });

		const orders = ordersFromDB.map((order) => ({
			...order,
			amount: Number(order.amount),
		}));

		expect(orders).toStrictEqual([
			{
				id: expect.any(String),
				externalId: "e653f3e14bc4",
				merchantId: "86312006-4d7e-45c4-9c28-788f4aa68a62",
				amount: 102.29,
				transactionDate: new Date("2023-02-01T00:00:00.000Z"),
				createdAt: expect.any(Date),
				updatedAt: expect.any(Date),
				deletedAt: null,
			},
		]);
	});
});
