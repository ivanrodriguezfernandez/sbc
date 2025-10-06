import {
	disbursementFrequencyType as prismaDisbursementFrequencyType,
	PrismaClient,
} from "@prisma/client";
import { StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { getDB } from "../../../src/__shared__/infrastructure/db";
import { app } from "../../config/appInstance";
import { setupTestDb } from "../../config/setup";

let prisma: PrismaClient;
let container: StartedPostgreSqlContainer;

const DisbursementFrequencyType = prismaDisbursementFrequencyType;

describe("Given a GET request to /orders", () => {
	beforeAll(async () => {
		container = await setupTestDb();
		prisma = getDB();
	}, 60_000);

	afterAll(async () => {
		await prisma.$disconnect();
		await container.stop();
	});

	it("THEN it returns status 200 with a list of orders", async () => {
		//TODO: builder pattern
		const merchant = await prisma.merchant.create({
			data: {
				id: "86312006-4d7e-45c4-9c28-788f4aa68a62",
				reference: "padberg_group",
				email: "info@padberg-group.com",
				liveOn: new Date("2023-02-01T00:00:00.000Z"),
				disbursementFrequency: DisbursementFrequencyType.DAILY,
				minimumMonthlyFee: 0.0,
			},
		});

		await prisma.order.create({
			data: {
				externalId: "e653f3e14bc4",
				merchantId: merchant.id,
				amount: 102.29,
				transactionDate: new Date("2023-02-01"),
			},
		});

		const agent = request.agent(app);
		const response = await agent.get("/api/orders");

		expect(response.status).toBe(200);
		const body = response.body;

		expect(body.data).toStrictEqual([
			{
				id: expect.any(String),
				externalId: "e653f3e14bc4",
				merchantId: "86312006-4d7e-45c4-9c28-788f4aa68a62",
				transactionDate: "2023-02-01T00:00:00.000Z",
				amount: 102.29,
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
				deletedAt: null,
			},
		]);
	});
});
