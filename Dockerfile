## === Build React APP
FROM node:22-alpine AS builder

WORKDIR /app/frontend

COPY frontend/ ./

RUN npm ci

RUN npm run build

## === Run Server
FROM node:22-bookworm

WORKDIR /app

COPY backend/ ./

RUN npm ci

RUN npx playwright install chromium
RUN npx playwright install-deps chromium

COPY --from=builder /app/frontend/dist ./public

ENV NODE_ENV=production

ENV PORT=3001
EXPOSE 3001

CMD ["node", "server.js"]