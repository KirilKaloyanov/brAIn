# Multi-stage build (docs/architecture.md §8): build everything, then ship only the dist folders
# and the server's production dependencies.

FROM node:24-slim AS build
WORKDIR /app
# Husky's git hooks are for development; skip them here.
ENV HUSKY=0
# Manifests first, so the npm ci layer is cached while only source files change.
COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN npm ci
COPY . .
RUN npm run build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY apps/server/package.json apps/server/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
# --ignore-scripts: the root "prepare" script runs husky, a dev dependency that isn't installed.
RUN npm ci --omit=dev --workspace @brain/server --ignore-scripts && npm cache clean --force
COPY --from=build /app/packages/shared/dist packages/shared/dist
COPY --from=build /app/apps/server/dist apps/server/dist
COPY --from=build /app/apps/web/dist apps/web/dist
USER node
# Cloud Run sets PORT; 8080 is its default and the config's.
EXPOSE 8080
CMD ["node", "apps/server/dist/index.js"]
