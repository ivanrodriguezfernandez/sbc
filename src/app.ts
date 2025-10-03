import express, { type Express, Request, Response } from "express";

export const createApp = (): Express =>{
    const app = express();
    app.set("port", 3000);

    app.get("/api/merchants", (_req: Request, res: Response) => {
        res.status(200).send('Hello World!')
        return app;
    });
    return app;
}