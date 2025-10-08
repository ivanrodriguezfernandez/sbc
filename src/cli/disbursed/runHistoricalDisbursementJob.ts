import { DISBURSEMENT_FREQUENCY_TYPE } from "../../../src/order/domain/disbursementFrequencyType";
import { getDB } from "../../__shared__/infrastructure/db";
import { getUniqueOrderTransactionDates } from "../../order/aplication/getUniqueOrderTransactionDates";

//todo:fix alias path

export async function processDaily(): Promise<string> {
	const prisma = getDB();
	const dates = await getUniqueOrderTransactionDates();

	console.log("range of data", dates.length);
	// for (let date of dates) {
	// }

	const merchants = await prisma.merchant.findMany({
		where: { disbursementFrequency: DISBURSEMENT_FREQUENCY_TYPE.DAILY },
	});

	for (let merchant of merchants) {
		const orders = await prisma.order.findMany({ where: { merchantId: merchant.id } });
		console.log(`For merchanat${merchant.reference}, we have a number of orders: ${orders.length}`);

		// for (let order of orders) {
		// }
	}
	return "hola"; //getUniqueOrderTransactionDates
}
