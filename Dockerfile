FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

RUN apk add --no-cache dumb-init

COPY . .

USER node

EXPOSE 3000

CMD ["dumb-init", "node", "server.js"]
