# Stage 1: Prepare frontend files
FROM node:22-alpine AS builder

WORKDIR /app

COPY . .

# Stage 2: Lightweight runtime
FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder --chown=node:node /app .

USER node

EXPOSE 3000

CMD ["node", "server.js"]
