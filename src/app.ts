import express, { type Express } from "express";

// eslint-disable-next-line no-restricted-imports
import merchantController from "../src/merchants/infrastructure/merchantController";

export const createApp = (): Express => {
	const app = express();
	app.set("port", 3000);

	app.use("/api", merchantController);

	return app;
};
