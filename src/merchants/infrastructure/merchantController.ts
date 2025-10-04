import { getMerchants } from "../aplication/getMerchants";
import express, { NextFunction, Request, Response } from "express";

const router = express.Router();

router.get("/merchants", async (_req: Request, res: Response, _next: NextFunction) => {
	const result = getMerchants();
	res.status(200).send(result);
});

export default router;
