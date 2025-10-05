.DEFAULT_GOAL := help

.PHONY: help
help:
	@grep -E '^[a-zA-Z_\/-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

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