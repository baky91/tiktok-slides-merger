FROM mcr.microsoft.com/playwright:v1.64.1-noble

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3001

CMD ["npm", "start"]