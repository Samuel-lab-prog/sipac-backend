FROM oven/bun:1 AS build

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
ENV NODE_ENV=development
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hello_poetry_dev?schema=public
ARG PRISMA_SCHEMA=src/generic-subdomains/persistance/prisma/schema.prisma
RUN bunx prisma generate --schema $PRISMA_SCHEMA
ENV NODE_ENV=production
RUN bun run build

FROM oven/bun:1 AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

COPY --from=build /app/dist ./dist
COPY --from=build /app/src/generic-subdomains/persistance/prisma/generated ./src/generic-subdomains/persistance/prisma/generated

EXPOSE 5000

CMD ["bun", "run", "start"]
