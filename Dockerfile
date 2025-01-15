FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bun run build

FROM oven/bun:1-slim
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/package.json .
EXPOSE 3000 6969
ENV NODE_ENV=production
ENTRYPOINT ["bun", "./build/index.js"]
