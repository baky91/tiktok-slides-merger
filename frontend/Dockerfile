## === Build
FROM node:22-alpine as builder

ENV VITE_API_BASE_URL=http://localhost:3001

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

RUN npm run build

## === Run
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]