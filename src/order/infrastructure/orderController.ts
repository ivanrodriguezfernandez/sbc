import express, { NextFunction, Request, Response } from "express";

import { getOrders } from "../aplication/getOrders";

const router = express.Router();

router.get("/orders", async (_req: Request, res: Response, _next: NextFunction) => {
	const result = await getOrders();
	res.status(200).send(result);
});

export default router;
