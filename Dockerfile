FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

RUN apk add --no-cache dumb-init

COPY . .

RUN mkdir -p logs && chown -R node:node logs

USER node

EXPOSE 3000

CMD ["dumb-init", "node", "server.js"]
