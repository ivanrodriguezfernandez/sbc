import { PrismaClient } from "@prisma/client";
import Decimal from "decimal.js";

import { createDbContext } from "../../src/__shared__/infrastructure/prisma.extensions";
import { processDaily } from "../../src/cli/disbursed/runHistoricalDisbursementJob";
import { DISBURSEMENT_FREQUENCY_TYPE } from "../../src/order/domain/disbursementFrequencyType";
import { setupPostgresContainer, teardownPostgresContainer } from "../config/setup";

let prisma: PrismaClient;
describe("Process history", () => {
	beforeAll(async () => {
		const setup = await setupPostgresContainer();
		prisma = setup.prisma;
	});

	afterAll(async () => {
		await teardownPostgresContainer();
	});

	afterEach(async () => {
		await prisma.disbursement.deleteMany();
		await prisma.order.deleteMany();
		await prisma.merchant.deleteMany();
	});
	it("should process orders of merchant type daily", async () => {
		const dbContext = createDbContext(prisma);
		const merchant = await dbContext.merchant.create({
			reference: "padberg_group_IVAN",
			disbursementFrequency: DISBURSEMENT_FREQUENCY_TYPE.DAILY,
		});

		const order1 = await dbContext.order.create({
			merchantId: merchant.id,
			transactionDate: new Date("2023-03-01T00:00:00.000Z"),
			amount: new Decimal(10),
		});
		const order2 = await dbContext.order.create({
			merchantId: merchant.id,
			transactionDate: new Date("2023-03-15T00:00:00.000Z"),
			amount: new Decimal(20),
		});

		await dbContext.order.create({
			merchantId: merchant.id,
			transactionDate: new Date("2023-03-31T12:00:00.000Z"),
			amount: new Decimal(30),
		});

		await processDaily();

		const disbursements = await prisma.disbursement.findMany({ orderBy: { disbursedAt: "asc" } });

		const disbursementsConverted = disbursements.map((d) => ({
			...d,
			totalGross: new Decimal(d.totalGross.toString()),
			totalCommission: new Decimal(d.totalCommission.toString()),
			payout: new Decimal(d.payout.toString()),
		}));
		const expected = [
			{
				id: expect.any(String),
				merchantId: merchant.id,
				disbursedAt: new Date("2023-03-01T06:00:00.000Z"),
				totalGross: new Decimal(10),
				totalCommission: new Decimal(0.1),
				payout: new Decimal(9.9),
			},
			{
				id: expect.any(String),
				merchantId: merchant.id,
				disbursedAt: new Date("2023-03-15T06:00:00.000Z"),
				totalGross: new Decimal(20),
				totalCommission: new Decimal(0.2),
				payout: new Decimal(19.8),
			},
		];
		expect(disbursementsConverted).toStrictEqual(expected);

		const orderIds = [order1.id, order2.id];

		const count = await prisma.order.count({
			where: {
				id: { in: orderIds },
				disbursementId: { not: null },
			},
		});
		expect(count).toStrictEqual(2);
	});
});
