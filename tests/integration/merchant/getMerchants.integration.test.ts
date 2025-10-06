import {
	disbursementFrequencyType as prismaDisbursementFrequencyType,
	PrismaClient,
} from "@prisma/client";
import request from "supertest";

import { app } from "../../config/appInstance";
import { setupPostgresContainer, teardownPostgresContainer } from "../../config/setup";

let prisma: PrismaClient | undefined;

const DisbursementFrequencyType = prismaDisbursementFrequencyType;

describe("Given a GET request to /merchants", () => {
	beforeAll(async () => {
		const setup = await setupPostgresContainer();
		prisma = setup.prisma;
	});

	afterAll(async () => {
		await teardownPostgresContainer();
	});
	it("THEN it returns status 200 with a list of merchants", async () => {
		await prisma?.merchant.create({
			data: {
				id: "86312006-4d7e-45c4-9c28-788f4aa68a62",
				reference: "padberg_group",
				email: "info@padberg-group.com",
				liveOn: new Date("2023-02-01T00:00:00.000Z"),
				disbursementFrequency: DisbursementFrequencyType.DAILY,
				minimumMonthlyFee: 0.0,
			},
		});

		const agent = request.agent(app);
		const response = await agent.get("/api/merchants");

		expect(response.status).toBe(200);
		const body = response.body;

		expect(body.data).toStrictEqual([
			{
				id: expect.any(String),
				reference: "padberg_group",
				email: "info@padberg-group.com",
				liveOn: "2023-02-01T00:00:00.000Z",
				disbursementFrequency: "DAILY",
				minimumMonthlyFee: 0.0,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
				deletedAt: null,
			},
		]);
	});
});
