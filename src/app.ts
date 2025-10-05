import express, { type Express } from "express";

import merchantController from "./merchant/infrastructure/merchantController";
import orderController from "./order/infrastructure/orderController";

export const createApp = (): Express => {
	const app = express();
	app.set("port", 3000);

	app.use("/api", merchantController);
	app.use("/api", orderController);

	return app;
};
