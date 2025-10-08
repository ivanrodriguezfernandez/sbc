import { addWeeks, isBefore, startOfWeek } from "date-fns";

import { getDB } from "../../__shared__/infrastructure/db";

export async function getWeeksForAllOrders(): Promise<Array<{ start: Date; end: Date }>> {
	const prisma = getDB();
	const result = await prisma.order.aggregate({
		_min: {
			transactionDate: true,
		},
		_max: {
			transactionDate: true,
		},
	});
	const minDate = result._min.transactionDate;
	const maxDate = result._max.transactionDate;
	const firstMonday = startOfWeek(minDate, { weekStartsOn: 1 });

	const weeks: { start: Date; end: Date }[] = [];
	let current = firstMonday;

	while (isBefore(current, maxDate)) {
		const start = current;
		const end = addWeeks(start, 1);
		weeks.push({ start, end });
		current = end;
	}
	return weeks;
}
