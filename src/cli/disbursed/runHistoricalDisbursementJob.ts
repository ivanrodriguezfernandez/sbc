import { getDB } from "../../__shared__/infrastructure/db";

export async function getDistinctTransactionDates(): Promise<Array<Date>> {
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
