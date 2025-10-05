import { getDB } from "../../__shared__/infrastructure/db";

export async function getMerchants() {
	const prisma = getDB();
	const merchants = await prisma.merchant.findMany();
	return merchants;
}
