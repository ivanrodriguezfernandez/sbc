import express, { NextFunction, Request, Response } from "express";

// eslint-disable-next-line no-restricted-imports
import { getMerchants } from "../aplication/getMerchants";

const router = express.Router();

router.get("/merchants", async (_req: Request, res: Response, _next: NextFunction) => {
	const result = await getMerchants();
	res.status(200).send(result);
});

export default router;
