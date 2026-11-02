## === Build React APP
FROM node:22-alpine AS builder

WORKDIR /app/frontend

COPY frontend/ ./

RUN npm ci

RUN npm run build

## === Run Server
FROM node:22-slim

WORKDIR /app

COPY backend/ ./

RUN npm ci

COPY --from=builder /app/frontend/dist ./public

ENV NODE_ENV=production

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]