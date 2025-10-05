import { getDB } from "../../__shared__/infrastructure/db";
import { Order } from "../domain/order";

export async function getOrders(): Promise<Result<Array<Order>>> {
	const prisma = getDB();
	const ordersFromDB = await prisma.order.findMany();

	const orders: Order[] = ordersFromDB.map((order) => ({
		...order,
		amount: Number(order.amount),
	}));

	return { isSuccess: true, data: orders };
}
