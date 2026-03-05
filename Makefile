.PHONY: install setup dev dev-frontend dev-backend build build-frontend build-backend \
       lint lint-fix format typecheck docker-build docker-up docker-down docker-logs \
       docker-restart clean

# ---- Setup ----
install:
	pnpm install

setup: install
	@cp -n .env.example .env 2>/dev/null || true
	@echo "Setup complete. Edit .env with your OpenRouter API key."

# ---- Development ----
dev:
	pnpm -r --parallel dev

dev-frontend:
	pnpm --filter @cvrx/frontend dev

dev-backend:
	pnpm --filter @cvrx/backend dev

# ---- Build ----
build:
	pnpm run build

build-frontend:
	pnpm --filter @cvrx/frontend build

build-backend:
	pnpm --filter @cvrx/backend build

# ---- Quality ----
lint:
	pnpm -r lint

lint-fix:
	pnpm -r lint -- --fix

format:
	pnpm run format

typecheck:
	pnpm -r typecheck

# ---- Docker ----
docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-restart: docker-down docker-up

# ---- Cleanup ----
clean:
	rm -rf packages/*/dist packages/*/.next packages/*/node_modules node_modules
