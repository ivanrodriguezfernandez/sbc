import express, { NextFunction, Request, Response } from "express";

const router = express.Router();

router.get("/merchants", async (_req: Request, res: Response, _next: NextFunction) => {
	const data = [
		{
			id: "86312006-4d7e-45c4-9c28-788f4aa68a62",
			reference: "padberg_group",
			email: "info@padberg-group.com",
			live_on: "2023-02-01",
			disbursement_frequency: "DAILY",
			minimum_monthly_fee: 0.0,
		},
	];
	res.status(200).send(data);
});

export default router;
