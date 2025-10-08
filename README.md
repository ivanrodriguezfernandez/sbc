# seQura backend coding challenge

## Goal

The main goal was to build an API and a CLI tool to import, process, and query financial data for merchants and orders, ensuring traceability, referential integrity, and financial accuracy.

## Tech Stack Overview

- **Node.js:** v22.20.0 – runtime environment for executing TypeScript/JavaScript code.
- **API / Framework:** [Express](https://expressjs.com/) – minimal and fast framework for building RESTful APIs.
- **Language:** [TypeScript](https://typescriptlang.org) – static typing for safer and more maintainable code.
- **Database / ORM:** [Prisma](https://www.prisma.io/) + [PostgreSQL](https://www.postgresql.org/) – type-safe ORM with Testcontainers support for integration testing.
- **Testing:** [Vitest](https://vitest.dev/) + [Supertest](https://github.com/visionmedia/supertest) – unit and integration tests for APIs.
- **Test Containers:** `@testcontainers/postgresql` – ephemeral PostgreSQL instances for testing.
- **Data Handling:** `csv-parse` – CSV parsing, import/export functionality.
- **Date Utilities:** [date-fns](https://date-fns.org/) – used for parsing CSV dates, calculating date ranges, and formatting timestamps for disbursements.
- **Decimal Utilities:** [decimal.js](https://www.npmjs.com/package/decimal.js) An arbitrary-precision Decimal type for JavaScript.
  – precise decimal arithmetic for financial and scientific calculations.
- **Logging:** [`pino`](https://getpino.io/) + [`pino-pretty`](https://github.com/pinojs/pino-pretty) – structured and readable logs.
- **Shell / Scripting:** `shelljs`, `tsx` – shell scripts and direct TypeScript execution without prior compilation.
- **Code Quality / Linting:** ESLint + Prettier + plugins (`import`, `simple-import-sort`, `prettier`) – linting, formatting, and import sorting.

## Initial Setup

Before you clone (copy) the project, you must configure your local environment by installing [Docker](https://docs.docker.com/engine/install/) and [NPM](https://www.npmjs.com/) dependencies in your machine.

The way of interacting with the project is the Makefile. To see all the available commands and the descriptions, you can run `make help` or `make` to see the list of commands.

Right after you clone the project, you **must** launch the Makefile recipe called `setup` typing in your terminal:

- `make setup`

This recipe will configure your local project to be ready for use.

## How to use

To import merchants, you must run the following command:

- `make merchants`

```console
[23:36:32] INFO (95946): Starting import from file: ./src/cli/merchants.csv
[23:36:32] INFO (95946): Processing row 1: padberg_group
[23:36:32] INFO (95946): Processing row 2: deckow_gibson
[23:36:32] INFO (95946): Processing row 3: romaguera_and_sons
[23:36:32] INFO (95946): Processing row 4: rosenbaum_parisian
********
********
********
[23:36:32] INFO (95946): Processing row 47: hilpert_senger
[23:36:32] INFO (95946): Processing row 48: dare_inc
[23:36:32] INFO (95946): Processing row 49: wisoky_llc
[23:36:32] INFO (95946): Processing row 50: cormier_weissnat_and_hauck
[23:36:32] INFO (95946): Import finished! Total rows processed: 50
```

To import orders, you must run the following command:

- `make orders`

```console
Load merchants: 21.044ms
[23:36:36] INFO (95989): Starting import from file: ./src/cli/orders.csv
[23:36:36] INFO (95989): Loaded 50 merchants
[23:36:37] INFO (95989): 10000 rows processed
[23:36:37] INFO (95989): 20000 rows processed
[23:36:38] INFO (95989): 30000 rows processed
[23:36:39] INFO (95989): 40000 rows processed
********
********
********
[23:38:19] INFO (95989): 1270000 rows processed
[23:38:20] INFO (95989): 1280000 rows processed
[23:38:21] INFO (95989): 1290000 rows processed
[23:38:21] INFO (95989): 1300000 rows processed
Execution Time: 1:47.069 (m:ss.mmm)
```

To process all historical records for calculating Disbursements

- `make history`

```console
[23:39:27] INFO (96277): Starting processDaily/weekly
[23:39:54] INFO (96277): 1000 disbursement processed
[23:40:10] INFO (96277): 2000 disbursement processed
[23:40:23] INFO (96277): 3000 disbursement processed
[23:40:37] INFO (96277): 4000 disbursement processed
[23:40:51] INFO (96277): 5000 disbursement processed
[23:41:05] INFO (96277): 6000 disbursement processed
[23:41:18] INFO (96277): 7000 disbursement processed
[23:41:32] INFO (96277): 8000 disbursement processed
[23:41:46] INFO (96277): 9000 disbursement processed
[23:42:00] INFO (96277): 10000 disbursement processed
[23:42:13] INFO (96277): 11000 disbursement processed
Execution Time: 2:59.788 (m:ss.mmm)
[23:42:27] INFO (96277): Finish processDaily: Total disbursement processed: 11967
```

Start the API server and watch for changes in your files. The server will be available at `http://localhost:3000`.

- `make api`

The Api exposes the following endpoints:

- `http://localhost:3000/api/merchants`
- `http://localhost:3000/api/orders`
- `http://localhost:3000/api/disbursement` (Not Implemented)

## Project Overview

The main goal of this project is to build an **API** and a **CLI tool** to import, process, and query financial data for **merchants** and **orders**, ensuring traceability, referential integrity, and financial accuracy.

## General Process

1. **API Endpoints**: Define and expose the database model via Prisma.
2. **CLI Importer**: Load CSV data directly into the database.
3. **Relational Schema Design**: Focused on data integrity and reconciliation between external and internal systems.
4. **Validations and Reporting**:
   - Detect missing merchants
   - Validate column formats
   - Handle duplicate IDs
   - Error reporting per row (`import_report` folder)

## Database Models

### Merchant

Represents a business that can have multiple orders and disbursements.

```console
model merchant {
  id                    String                    @id @default(uuid())
  reference             String
  email                 String
  liveOn                DateTime
  disbursementFrequency disbursementFrequencyType
  minimumMonthlyFee     Float
  orders                order[]

  // Audit
  createdAt    DateTime       @default(now()) @db.Timestamptz(6)
  updatedAt    DateTime       @updatedAt @db.Timestamptz(6)
  deletedAt    DateTime?      @db.Timestamptz(6)

  disbursement disbursement[]

  @@unique([id, reference, email])
}
```

Fields explanation:

- id: Internal UUID, primary key.
- reference: Business identifier, mutable.
- email, liveOn, disbursementFrequency, minimumMonthlyFee: Business data.
- orders: Relationship to order.
- disbursement: Relationship to disbursement.
- Audit fields: track creation, updates, and soft deletion.

### Order

Represents a financial transaction linked to a merchant and potentially a disbursement.

```console
model order {
  id              String   @id @default(uuid())
  externalId      String
  merchantId      String
  disbursementId  String?
  amount          Decimal  @db.Decimal(12, 2)
  transactionDate DateTime

  // Audit
  createdAt DateTime  @default(now()) @db.Timestamptz(6)
  updatedAt DateTime  @updatedAt @db.Timestamptz(6)
  deletedAt DateTime? @db.Timestamptz(6)

  merchant     merchant      @relation(fields: [merchantId], references: [id])
  disbursement disbursement? @relation(fields: [disbursementId], references: [id])

  @@unique([externalId, merchantId])
  @@index([merchantId])
}

```

Fields explanation:

- id: Internal UUID, primary key.

- externalId: ID from external system (CSV or API).

- merchantId: FK to merchant, ensures referential integrity.

- disbursementId: Optional FK to a disbursement.

- amount: Monetary value using Decimal for precision.

- transactionDate: Date of the transaction.

- Audit fields: track creation, updates, and soft deletion.

### Disbursement

Represents a payout to a merchant, grouping multiple orders.

```console
model disbursement {
  id              String    @id @default(uuid())
  merchantId      String
  disbursedAt     DateTime? @db.Timestamptz(6)
  totalGross      Decimal   @db.Decimal(12, 2)
  totalCommission Decimal   @db.Decimal(12, 2)
  payout          Decimal   @db.Decimal(12, 2)

  merchant merchant @relation(fields: [merchantId], references: [id])
  orders   order[]
}

```

Fields explanation:

- id: Internal UUID, primary key.

- merchantId: FK to merchant.

- disbursedAt: Date/time when payout occurred.

- totalGross: Sum of order amounts.

- totalCommission: Sum of fees deducted.

- payout: Net amount paid to merchant.

- Relationships: links to merchant and associated orders.

## Relationships Overview

-Merchant → Orders: One-to-many (merchant.orders)

-Merchant → Disbursement: One-to-many (merchant.disbursement)

-Order → Disbursement: Many-to-one (order.disbursement)

-Disbursement → Orders: One-to-many (disbursement.orders)

All IDs are internal UUIDs; external IDs (externalId) are used for reconciliation.

## Advantages of This Design

- Clear separation between internal and external identifiers.

- Referential integrity: changing reference does not break links.

- Accurate financial calculations with Decimal.

- Audit trails and soft delete support.

- Scalable: indexes on key fields (merchantId, reference) for performance.

- Import-safe: idempotent operations using externalId for updates.

# Assumptions of the Merchant & Orders System

This document summarizes the main **assumptions and design decisions** made in the project.

---

## 1. IDs and References

- Each **merchant** and **order** has an internal **UUID** (`id`) for consistency and immutability.
- Each **order** has an `externalId` from the CSV or external system.
- Changing a merchant’s `reference` **does not break database integrity**, since relationships are based on `merchantId`.

---

## 2. Dates and Timezones

- All dates (`transactionDate`, `disbursedAt`) are stored in **UTC**.
- Imports are normalized to **06:00 UTC** for consistent daily processing.
- For merchants with **WEEKLY** frequency, the **weekday of `liveOn`** determines the payout day.

---

## 3. CSV Import

- CSV files are expected to be **semicolon-delimited**.
- If a merchant does not exist, an error is logged in `import_report`.
- If an order with the same `externalId` exists, its amount is updated; otherwise, a new order is created.

---

## 4. Financial Calculations

- All monetary amounts use `Decimal(12,2)` for precision.
- `minimumMonthlyFee` is applied according to the merchant’s frequency.
- `totalGross`, `totalCommission`, and `payout` in `disbursement` accurately sum associated orders.

---

## 5. Idempotency and Duplicates

- Re-running the import **does not create duplicates**.
- Existing rows (same `externalId`) are updated.
- `skipDuplicates: true` is used in `createMany` for efficient idempotent operations.
- External IDs are assumed stable; changes in `externalId` create new orders.

---

## 6. Performance

- Preloading merchants into memory improves performance for large imports.
- Streams and buffers are used to avoid memory issues with large CSVs.

---

## 7. Audit and Soft Delete

- All tables include `createdAt`, `updatedAt`, and `deletedAt`.
- Soft-deleted records remain in the database but are excluded from business logic.

---

## 8. Disbursement Logic

- DAILY merchants receive payments every day they have orders.
- WEEKLY merchants receive payments on the weekday of their `liveOn` field.
- Disbursement totals are calculated per merchant for the relevant date ranges.
