import {
	disbursementFrequencyType as prismaDisbursementFrequencyType,
	PrismaClient,
} from "@prisma/client";

import { createDbContext } from "../../src/__shared__/infrastructure/prisma.extensions";
import { processDaily } from "../../src/cli/disbursed/runHistoricalDisbursementJob";
import { setupPostgresContainer, teardownPostgresContainer } from "../config/setup";

const DisbursementFrequencyType = prismaDisbursementFrequencyType;

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
		await prisma.order.deleteMany();
		await prisma.merchant.deleteMany();
	});
	it("should process orders of merchant type daily", async () => {
		//processDaily
		const dbContext = createDbContext(prisma);
		const merchant = await dbContext.merchant.create({
			reference: "padberg_group",
			disbursementFrequency: DisbursementFrequencyType.DAILY,
		});
		const merchantW = await dbContext.merchant.create({
			reference: "padberg_group2",
			disbursementFrequency: DisbursementFrequencyType.WEEKLY,
		});

		await dbContext.order.create({
			merchantId: merchant.id,
			transactionDate: new Date("2023-03-01T00:00:00.000Z"),
			amount: 10,
		});
		await dbContext.order.create({
			merchantId: merchant.id,
			transactionDate: new Date("2023-03-15T00:00:00.000Z"),
			amount: 20,
		});
		await dbContext.order.create({
			merchantId: merchant.id,
			transactionDate: new Date("2023-03-15T00:00:00.000Z"),
			amount: 30,
		});
		await dbContext.order.create({
			merchantId: merchant.id,
			transactionDate: new Date("2023-03-31T00:00:00.000Z"),
			amount: 40,
		});
		const result = await processDaily();
		expect(result).toBe("hola");
	});
});
