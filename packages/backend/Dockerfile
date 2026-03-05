FROM node:22-slim AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/backend/package.json packages/backend/
RUN pnpm install --frozen-lockfile

# Build
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/shared packages/shared
COPY packages/backend packages/backend
RUN pnpm --filter @cvrx/shared build
RUN pnpm --filter @cvrx/backend build

# Production
FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/packages/backend/dist ./dist
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/backend/node_modules ./packages/backend/node_modules
COPY --from=deps /app/packages/shared/dist ./packages/shared/dist
COPY packages/backend/package.json ./package.json

EXPOSE 3001
ENV PORT=3001
CMD ["node", "dist/index.js"]
