import request from "supertest";
import { describe, it, expect } from 'vitest';
import { app } from "./config/appInstance";

describe('Given a GET request to /merchants', () => {
  it('THEN it returns status 200 with a list of merchants', async () => {
		const agent = request.agent(app);
    const response = await agent.get("/api/merchants")
    expect(response.status).toBe(200);
  });
});