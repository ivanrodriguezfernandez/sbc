import { getDay } from "date-fns";
import Decimal from "decimal.js";

import { Merchant } from "@/src/merchant/domain/merchant";

import { DISBURSEMENT_FREQUENCY_TYPE } from "../../../src/order/domain/disbursementFrequencyType";
import { getDB } from "../../__shared__/infrastructure/db";
import { logger } from "../../__shared__/infrastructure/logger";

export async function historicalDisbursementJob(): Promise<void> {
	logger.info(`Starting processDaily/weekly`);
	console.time("Execution Time");
	const prisma = getDB();
	let rowNumber = 0;
	const dates = await getUniqueOrderTransactionDates();
	const merchants = await prisma.merchant.findMany();

	for (let date of dates) {
		date.setUTCHours(6, 0, 0, 0); // 2 hours before 8:00 UTC
		for (let merchant of merchants) {
			if (
				merchant.disbursementFrequency === DISBURSEMENT_FREQUENCY_TYPE.DAILY ||
				(merchant.disbursementFrequency === DISBURSEMENT_FREQUENCY_TYPE.WEEKLY &&
					todayIsMerchantPayday(merchant))
			) {
				const orders = await prisma.order.findMany({
					where: {
						merchantId: merchant.id,
						disbursementId: null,
						transactionDate: { lt: date },
					},
				});
				let totalGross = new Decimal(0.0);
				let totalCommision = new Decimal(0.0);
				let payout = new Decimal(0.0);

				if (orders.length === 0) continue;

				for (let order of orders) {
					totalGross = totalGross.plus(order.amount);
					totalCommision = totalCommision.plus(calculateCommission(order.amount));
				}
				payout = totalGross.minus(totalCommision);

				const disbursement = await prisma.disbursement.create({
					data: {
						disbursedAt: new Date(date),
						merchantId: merchant.id,
						totalGross: totalGross,
						totalCommission: totalCommision,
						payout: payout,
					},
				});
				rowNumber++;

				const orderIds = orders.map((o) => o.id);
				await prisma.order.updateMany({
					where: { id: { in: orderIds } },
					data: { disbursementId: disbursement.id },
				});

				if (rowNumber % 1000 === 0) logger.info(`${rowNumber} disbursement processed`);
			}
		}
	}
	logger.info(`Finish processDaily: Total disbursement processed: ${rowNumber}`);
	console.timeEnd("Execution Time");
}

function calculateCommission(amount: Decimal): Decimal {
	if (amount.lessThan(50)) return amount.times(0.01);
	if (amount.lessThan(300)) return amount.times(0.0095);
	return amount.times(0.0085);
}

function todayIsMerchantPayday(merchant: Merchant) {
	const merchantWeekday = getDay(merchant.liveOn); // 0-6 (sunday-saturday)
	const todayWeekday = getDay(new Date());
	return merchantWeekday === todayWeekday;
}

export async function getUniqueOrderTransactionDates(): Promise<Array<Date>> {
	const prisma = getDB();

	const dates = await prisma.order.findMany({
		distinct: ["transactionDate"],
		select: {
			transactionDate: true,
		},
		orderBy: {
			transactionDate: "asc",
		},
	});

	return dates.map((d) => d.transactionDate);
}
