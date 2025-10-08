.DEFAULT_GOAL := help

.PHONY: help
help:
	@grep -E '^[a-zA-Z_\/-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: setup
setup: ## Install dependencies, launch the database and apply migrations
	@echo Installing all dependencies
	npm install
	docker-compose up -d  --wait
	make prisma/migrations/apply

.PHONY: stop
stop: ## Stop database container and remove volumes
	@echo Stopping database container and removing volumes
	docker-compose down -v

.PHONY: client/generate
prisma/client/generate: ## Generate the prisma client
	@echo Generating prisma client
	npx prisma generate

.PHONY: migrations/generate
prisma/migrations/generate: ## Generate the new migration files based on the schema.prisma
	@echo Generating the new migrations
	npx prisma migrate dev --create-only

.PHONY: migrations/apply
prisma/migrations/apply: ## Apply the pending migrations on the dev environment
	@echo Applying the pending migrations on the dev environment
	npx prisma migrate deploy


.PHONY: merchants
merchants: ## Import merchants
	npm run importMerchants -- filePath="./src/cli/merchants.csv"

.PHONY: orders
orders: ## Import orders
	npm run importOrders -- filePath="./src/cli/orders.csv"

.PHONY: history
history: ## Process all historical records
	npm run history


.PHONY: api
api: ## Launch API
	npm run dev
