import { PrismaClient } from "@prisma/client";

import { createDbContext } from "../../../../src/__shared__/infrastructure/prisma.extensions";
import { getWeeksForAllOrders } from "../../../../src/order/aplication/getWeeksForAllOrders";
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

	it("should return only distinct week dates from orders", async () => {
		const dbContext = createDbContext(prisma);
		const merchant = await dbContext.merchant.create({ reference: "padberg_group" });

		await dbContext.order.create({
			merchantId: merchant.id,
			transactionDate: new Date("2023-03-01T00:00:00.000Z"),
		});
		await dbContext.order.create({
			merchantId: merchant.id,
			transactionDate: new Date("2023-03-15T00:00:00.000Z"),
		});
		await dbContext.order.create({
			merchantId: merchant.id,
			transactionDate: new Date("2023-03-31T00:00:00.000Z"),
		});

		const data = await getWeeksForAllOrders();

		const dataStrings = data.map((w) => ({
			start: w.start.toISOString(),
			end: w.end.toISOString(),
		}));

		const expected = [
			{ start: "2023-02-26T23:00:00.000Z", end: "2023-03-05T23:00:00.000Z" },
			{ start: "2023-03-05T23:00:00.000Z", end: "2023-03-12T23:00:00.000Z" },
			{ start: "2023-03-12T23:00:00.000Z", end: "2023-03-19T23:00:00.000Z" },
			{ start: "2023-03-19T23:00:00.000Z", end: "2023-03-26T22:00:00.000Z" },
			{ start: "2023-03-26T22:00:00.000Z", end: "2023-04-02T22:00:00.000Z" },
		];
		expect(dataStrings).toStrictEqual(expected);
	});
});
