## === Build React APP
FROM node:20-alpine AS builder

WORKDIR /app/frontend

COPY frontend/ ./

RUN npm ci

RUN npm run build

## === Run Server

FROM mcr.microsoft.com/playwright:v1.64.1-noble

WORKDIR /app

ENV NODE_ENV=production

COPY backend/package*.json ./

RUN npm ci

COPY backend/*.js ./

COPY --from=builder /app/frontend/dist ./public

ENV PORT=3001
EXPOSE 3001

CMD ["node", "server.js"]