import Decimal from "decimal.js";

import { DISBURSEMENT_FREQUENCY_TYPE } from "../../../src/order/domain/disbursementFrequencyType";
import { getDB } from "../../__shared__/infrastructure/db";
import { getUniqueOrderTransactionDates } from "../../order/aplication/getUniqueOrderTransactionDates";

//todo:fix alias path

//const utcDate = new Date(Date.UTC(2025, 0, 1, 8, 0, 0));

export async function processDaily(): Promise<void> {
	const prisma = getDB();
	const dates = await getUniqueOrderTransactionDates();
	const merchants = await prisma.merchant.findMany({
		where: { disbursementFrequency: DISBURSEMENT_FREQUENCY_TYPE.DAILY },
	});

	for (let date of dates) {
		date.setUTCHours(6, 0, 0, 0); // 2 hours before 8:00 UTC
		for (let merchant of merchants) {
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

			const orderIds = orders.map((o) => o.id);
			await prisma.order.updateMany({
				where: { id: { in: orderIds } },
				data: { disbursementId: disbursement.id },
			});
		}
	}
}

function calculateCommission(amount: Decimal): Decimal {
	if (amount.lessThan(50)) return amount.times(0.01);
	if (amount.lessThan(300)) return amount.times(0.0095);
	return amount.times(0.0085);
}
