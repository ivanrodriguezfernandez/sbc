import { type Express } from "express";

// eslint-disable-next-line no-restricted-imports
import { createApp } from "../../src/app";

export const app: Express = createApp();
