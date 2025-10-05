import express, { type Express } from "express";

import merchantController from "@/src/merchants/infrastructure/merchantController";

export const createApp = (): Express => {
	const app = express();
	app.set("port", 3000);

	app.use("/api", merchantController);

	return app;
};
