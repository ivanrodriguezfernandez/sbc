import { PrismaClient } from "@prisma/client";
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import shelljs from "shelljs";

let container: StartedPostgreSqlContainer;
let prisma: PrismaClient;

export async function setupPostgresContainer(): Promise<{
	prisma: PrismaClient;
	container: StartedPostgreSqlContainer;
}> {
	container = await new PostgreSqlContainer("postgres:13.3-alpine")
		.withDatabase("testdb")
		.withUsername("testuser")
		.withPassword("testpass")
		.start();

	const mappedPort = container.getMappedPort(5432);
	const databaseUrl = `postgresql://testuser:testpass@localhost:${mappedPort}/testdb?schema=public`;

	process.env.DATABASE_URL = databaseUrl;

	shelljs.exec(`DATABASE_URL=${databaseUrl} npx prisma migrate deploy > /dev/null 2>&1`);

	prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });
	await prisma.$connect();

	return { prisma, container };
}

export async function teardownPostgresContainer(): Promise<void> {
	if (prisma) await prisma.$disconnect();
	if (container) await container.stop();
}
