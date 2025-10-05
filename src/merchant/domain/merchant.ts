export type Merchant = {
	id: string;
	reference: string;
	email: string;
	liveOn: Date;
	disbursementFrequency: "WEEKLY" | "DAILY";
	minimumMonthlyFee: number;
	createdAt: Date;
	updatedAt: Date;
	deletedAt: Date | null;
};
