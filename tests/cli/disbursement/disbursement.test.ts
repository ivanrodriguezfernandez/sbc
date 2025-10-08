import { PrismaClient } from "@prisma/client";

import { createDbContext } from "../../../src/__shared__/infrastructure/prisma.extensions";
import { getDistinctTransactionDates } from "../../../src/cli/disbursed/runHistoricalDisbursementJob";
import { setupPostgresContainer, teardownPostgresContainer } from "../../config/setup";

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
		const merchant = await dbContext.merchant.create({
			reference: "padberg_group",
			liveOn: new Date("2023-02-01T00:00:00.000Z"),
		});

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

		const data = await getDistinctTransactionDates();
		const expected = [
			new Date("2021-02-01T00:00:00.000Z"),
			new Date("2023-02-01T00:00:00.000Z"),
			new Date("2024-02-01T00:00:00.000Z"),
		];

		expect(data).toStrictEqual(expected);
	});
});
