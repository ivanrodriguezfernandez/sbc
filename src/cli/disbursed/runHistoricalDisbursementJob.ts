import {
	disbursementFrequencyType as prismaDisbursementFrequencyType,
	PrismaClient,
} from "@prisma/client";

import { getDB } from "../../__shared__/infrastructure/db";
import { getUniqueOrderTransactionDates } from "../../order/aplication/getUniqueOrderTransactionDates";

//todo:fix alias path

const DisbursementFrequencyType = prismaDisbursementFrequencyType;

export async function processDaily(): Promise<string> {
	const prisma = getDB();
	const dates = await getUniqueOrderTransactionDates();
	// console.log("data", dates);

	console.log("range of data", dates.length);
	// for (let date of dates) {
	// }

	const merchants = await prisma.merchant.findMany({
		where: { disbursementFrequency: DisbursementFrequencyType.DAILY },
	});

	for (let merchant of merchants) {
		const orders = await prisma.order.findMany({ where: { merchantId: merchant.id } });
		console.log(`For merchanat${merchant.reference}, we have a number of orders: ${orders.length}`);

		for (let order of orders) {
			// console.log(order);
		}
	}
	// console.log("merchants type daily", merchants);
	return "hola"; //getUniqueOrderTransactionDates
}
