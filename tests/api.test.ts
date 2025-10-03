import request from "supertest";
import { describe, it, expect } from "vitest";
import { app } from "./config/appInstance";

describe("Given a GET request to /merchants", () => {
	it("THEN it returns status 200 with a list of merchants", async () => {
		const agent = request.agent(app);

		const response = await agent.get("/api/merchants");

		expect(response.status).toBe(200);
		const body = response.body;
		expect(body).toStrictEqual([
			{
				id: "86312006-4d7e-45c4-9c28-788f4aa68a62",
				reference: "padberg_group",
				email: "info@padberg-group.com",
				live_on: "2023-02-01",
				disbursement_frequency: "DAILY",
				minimum_monthly_fee: 0.0,
			},
		]);
	});
});
