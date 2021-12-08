FROM node:latest

WORKDIR /usr/src/cbg-api
COPY package*.json ./

RUN npm ci --only-production

COPY . .

EXPOSE 3040

CMD ["npm", "start"]