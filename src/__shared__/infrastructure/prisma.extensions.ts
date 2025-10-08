import {
	type merchant as PrismaMerchant,
	type order as PrismaOrder,
	Prisma,
	PrismaClient,
} from "@prisma/client";
import { randomUUID } from "crypto";

import { DISBURSEMENT_FREQUENCY_TYPE } from "../../order/domain/disbursementFrequencyType";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createDbContext(prisma: PrismaClient) {
	const dbContext = prisma.$extends({
		model: {
			merchant: { create: createMerchant },
			order: { create: createOrder },
		},
	});

	async function createMerchant({
		reference = randomUUID(),
		liveOn = new Date(),
		disbursementFrequency = DISBURSEMENT_FREQUENCY_TYPE.DAILY,
	}: Partial<PrismaMerchant>) {
		return prisma.merchant.create({
			data: {
				id: randomUUID(),
				reference,
				email: `${reference}@${reference}.com`,
				liveOn,
				disbursementFrequency,
				minimumMonthlyFee: 0,
			},
		});
	}

	async function createOrder({
		externalId = randomUUID(),
		merchantId,
		amount = new Prisma.Decimal(0),
		transactionDate = new Date(),
	}: Partial<PrismaOrder>) {
		return prisma.order.create({
			data: {
				externalId,
				merchantId,
				amount: new Prisma.Decimal(amount),
				transactionDate,
			},
		});
	}

	return dbContext;
}
