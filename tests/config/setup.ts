import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { execSync } from "node:child_process";

export async function setupTestDb(): Promise<StartedPostgreSqlContainer> {
	const container = await new PostgreSqlContainer("postgres:15-alpine")
		.withDatabase("testdb")
		.withUsername("test")
		.withPassword("test")
		.start();

	process.env.DATABASE_URL = container.getConnectionUri();
	execSync("npx prisma migrate deploy", { stdio: "inherit" }); // show Prisma output in console
	return container;
}
