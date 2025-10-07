## Tech Stack Overview

- **API:** [Express](https://expressjs.com/) – fast, minimal REST framework
- **Language:** [TypeScript](https://typescriptlang.org) – static typing for safer code
- **Testing:** [Vitest](https://vitest.dev/) – unit & integration tests
- **Database:** Prisma + PostgreSQL – type-safe ORM with Testcontainers for testing
- **Data:** `csv-parse` / `csv-stringify` – CSV import/export
- **Logging:** `pino` + `pino-pretty` – structured and readable logs
- **Utilities:** `shelljs`, `tsx` – shell scripts & direct TS execution
- **Code Quality:** ESLint + Prettier – linting, formatting, import sorting

## Initial Setup

Before you clone the project, you must configure your local environment by installing [Docker](https://docs.docker.com/engine/install/) and [NPM](https://www.npmjs.com/) dependencies in your machine.

## FAQs

## VSCode config

The project has a VSCode configuration that will help you to work with the project. The configuration is located in the `.vscode` folder. The configuration includes:

- `settings.json`: This file includes the configuration for the editor.
- `extensions.json`: This file includes the extensions that are recommended to work with the project.
