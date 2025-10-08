# seQura backend coding challenge

## Tech Stack Overview

## Tech Stack Overview

- **API / Framework:** [Express](https://expressjs.com/) – minimal and fast framework for building RESTful APIs.
- **Language:** [TypeScript](https://typescriptlang.org) – static typing for safer and more maintainable code.
- **Database / ORM:** [Prisma](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/) – type-safe ORM with Testcontainers support for integration testing.
- **Testing:** [Vitest](https://vitest.dev/) + [Supertest](https://github.com/visionmedia/supertest) – unit and integration tests for APIs.
- **Test Containers:** `@testcontainers/postgresql` – ephemeral PostgreSQL instances for testing.
- **Data Handling:** `csv-parse` – CSV parsing, import/export functionality.
- **Date Utilities:** [date-fns](https://date-fns.org/) – date manipulation and formatting.
- **Logging:** [`pino`](https://getpino.io/) + [`pino-pretty`](https://github.com/pinojs/pino-pretty) – structured and readable logs.
- **Shell / Scripting:** `shelljs`, `tsx` – shell scripts and direct TypeScript execution without prior compilation.
- **Code Quality / Linting:** ESLint + Prettier + plugins (`import`, `simple-import-sort`, `prettier`) – linting, formatting, and import sorting.

## Initial Setup

Before you clone the project, you must configure your local environment by installing [Docker](https://docs.docker.com/engine/install/) and [NPM](https://www.npmjs.com/) dependencies in your machine.

The way of interacting with the project is the Makefile. To see all the available commands and the descriptions, you can run `make help` or `make` to see the list of commands.

Right after you clone the project, you **must** launch the Makefile recipe called `setup` typing in your terminal:

- `make setup`

This recipe will configure your local project to be ready for use.

## How to use

To import merchants, you must run the following command:

- `make merchants`

To import orders, you must run the following command:

- `make orders`

To process all historical records for calculating Disbursements

- `make history`

Start the API server and watch for changes in your files. The server will be available at `http://localhost:3000`.

- `make api`

The Api exposes the following endpoints:

- `http://localhost:3000/api/merchants`
- `http://localhost:3000/api/orders`
- `http://localhost:3000/api/disbursement`
