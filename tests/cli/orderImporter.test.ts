import fs from "node:fs";
import path from "node:path";

import {
	disbursementFrequencyType as prismaDisbursementFrequencyType,
	PrismaClient,
} from "@prisma/client";

import { importOrders } from "../../src/cli/order/orderImporter";
import { setupPostgresContainer, teardownPostgresContainer } from "../config/setup";

const getFilePath = (filename: string) => path.join(__dirname, `./csvMocks/${filename}`);

let prisma: PrismaClient;

const DisbursementFrequencyType = prismaDisbursementFrequencyType;

describe("Import order", () => {
	beforeAll(async () => {
		const setup = await setupPostgresContainer();
		prisma = setup.prisma;
	});

	afterAll(async () => {
		await teardownPostgresContainer();
	});

	it("WHEN csv column headers are invalid THEN it return an error message", async () => {
		const spy = vi.spyOn(fs, "writeFileSync").mockImplementation(() => {});
		const filePath = getFilePath("invalidColumns_orders.csv");

		await importOrders(filePath);

		const expected =
			"row;id;merchant_reference;amount;created_at;errors\n" + "0;;;;;Invalid column names\n";

		expect(fs.writeFileSync).toHaveBeenCalledWith("./importReport/report.csv", expected);
		spy.mockRestore();
	});

	it("WHEN csv is imported THEN database is populated", async () => {
		//todo: builder
		await prisma.merchant.upsert({
			where: { id: "86312006-4d7e-45c4-9c28-788f4aa68a62" },
			update: {
				reference: "padberg_group",
				email: "info@padberg-group.com",
				liveOn: new Date("2023-02-01T00:00:00.000Z"),
				disbursementFrequency: DisbursementFrequencyType.DAILY,
				minimumMonthlyFee: 0.0,
			},
			create: {
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
