## Tech Stack Overview

- **API:** [Express](https://expressjs.com/) – fast, minimal REST framework
- **Language:** [TypeScript](https://typescriptlang.org) – static typing for safer code
- **Testing:** [Vitest](https://vitest.dev/) – unit & integration tests
- **Database:** Prisma + PostgreSQL – type-safe ORM with Testcontainers for testing
- **Data:** `csv-parse` – CSV import/export
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

Una columna status (por ejemplo: "pending" | "disbursed" | "canceled").

Una columna executed_on para registrar la fecha en que se incluyó en un disbursement.

1️⃣ El problema básico

Tienes orders históricas de cada merchant, con montos y fechas.
Cada merchant tiene una frecuencia de pago: diaria o semanal.
Y un fee mínimo que se resta del total.

Tu objetivo: calcular cuánto hay que pagarle a cada merchant en cada periodo (día o semana).

2️⃣ Cómo hacerlo con sentido común

Para cada merchant:

Mira todas sus orders.

Averigua desde qué fecha hasta qué fecha tiene orders (tu rango ya lo sabes: 2022-09-04 → 2023-11-07).

Divide ese rango en periodos según la frecuencia del merchant:

DAILY → cada día del rango.

WEEKLY → cada semana del rango.

Para cada periodo:

Busca todas las orders que caen en ese periodo.

Suma sus montos.

Resta la fee mínima si aplica.

Guarda el resultado como el payout de ese periodo.

Repite hasta cubrir todo el rango histórico.

3️⃣ Cómo pensarlo en código (muy simple)

Haces un bucle que recorra todos los días o semanas entre la fecha mínima y máxima.

Dentro de ese bucle, filtras las orders que correspondan al periodo actual.

Calculas el total y le restas la fee.

Guardas ese total.

Piensa en esto como una hoja de cálculo: cada fila = un periodo, cada columna = merchant, total, fee, payout.
