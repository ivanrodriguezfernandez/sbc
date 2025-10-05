// eslint-disable-next-line no-restricted-imports
import { getDB } from "../../__shared__/infrastructure/db";
// eslint-disable-next-line no-restricted-imports
import { Merchant } from "../domain/merchant";

export async function getMerchants(): Promise<Result<Array<Merchant>>> {
	const prisma = getDB();
	const merchants = await prisma.merchant.findMany();
	return { isSuccess: true, data: merchants };
}
