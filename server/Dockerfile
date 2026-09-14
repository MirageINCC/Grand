# Build context is the repo root (see docker-compose.yml: context: ., dockerfile: server/Dockerfile)

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY server/package.json server/package.json
COPY client/package.json client/package.json
RUN npm ci

FROM deps AS client-build
COPY client client
RUN npm run build --workspace client

FROM deps AS server-build
COPY server server
RUN npm run build --workspace server

# Strip devDependencies (typescript, tsx, sharp, vite, ...) before shipping —
# they're only needed to build / to run the tile-generation script, not at runtime.
FROM server-build AS prod-deps
RUN npm prune --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/package.json ./package.json
COPY --from=server-build /app/server/dist ./dist
COPY --from=server-build /app/server/prisma ./prisma
COPY --from=client-build /app/client/dist ./public

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
