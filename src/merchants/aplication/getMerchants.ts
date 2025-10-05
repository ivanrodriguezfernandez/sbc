// eslint-disable-next-line no-restricted-imports
import { getDB } from "../../__shared__/infrastructure/db";

export async function getMerchants(): Promise<
	Array<{
		id: string;
		reference: string;
		email: string;
		liveOn: Date;
		disbursementFrequency: "WEEKLY" | "DAILY";
		minimumMonthlyFee: number;
		createdAt: Date;
		updatedAt: Date;
		deletedAt: Date | null;
	}>
> {
	const prisma = getDB();
	const merchants = await prisma.merchant.findMany();
	return merchants;
}
