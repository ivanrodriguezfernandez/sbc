import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | undefined;

export const getDB = (): PrismaClient => {
	prisma ??= new PrismaClient();
	return prisma;
};
