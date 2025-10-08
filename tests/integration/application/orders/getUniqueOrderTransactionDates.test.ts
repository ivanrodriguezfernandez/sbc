import { PrismaClient } from "@prisma/client";

import { createDbContext } from "../../../../src/__shared__/infrastructure/prisma.extensions";
import { getUniqueOrderTransactionDates } from "../../../../src/order/aplication/getUniqueOrderTransactionDates";
import { setupPostgresContainer, teardownPostgresContainer } from "../../../config/setup";

let prisma: PrismaClient;

describe("Historical Disbursement Job - Distinct Transaction Dates", () => {
	beforeAll(async () => {
		const setup = await setupPostgresContainer();
		prisma = setup.prisma;
	});

	afterAll(async () => {
		await teardownPostgresContainer();
	});

	afterEach(async () => {
		await prisma.order.deleteMany();
		await prisma.merchant.deleteMany();
	});
	it("should return only distinct transaction dates from orders", async () => {
		const dbContext = createDbContext(prisma);
		const merchant = await dbContext.merchant.create({ reference: "padberg_group" });

		await dbContext.order.create({
			merchantId: merchant.id,
			transactionDate: new Date("2021-02-01T00:00:00.000Z"),
		});
		await dbContext.order.create({
			merchantId: merchant.id,
			transactionDate: new Date("2023-02-01T00:00:00.000Z"),
		});
		await dbContext.order.create({
			merchantId: merchant.id,
			transactionDate: new Date("2023-02-01T00:00:00.000Z"),
		});
		await dbContext.order.create({
			merchantId: merchant.id,
			transactionDate: new Date("2024-02-01T00:00:00.000Z"),
		});

		const data = await getUniqueOrderTransactionDates();

		const dataStrings = data.map((d) => d.toISOString());

		const expected = [
			"2021-02-01T00:00:00.000Z",
			"2023-02-01T00:00:00.000Z",
			"2024-02-01T00:00:00.000Z",
		];

		expect(dataStrings).toStrictEqual(expected);
	});
});
