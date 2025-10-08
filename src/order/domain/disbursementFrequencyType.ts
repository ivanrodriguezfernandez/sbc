import { disbursementFrequencyType as prismaDisbursementFrequencyType } from "@prisma/client";

const disbursementFrequencyType = prismaDisbursementFrequencyType;

type disbursementFrequencyType =
	(typeof disbursementFrequencyType)[keyof typeof disbursementFrequencyType];

export { disbursementFrequencyType as DISBURSEMENT_FREQUENCY_TYPE };
