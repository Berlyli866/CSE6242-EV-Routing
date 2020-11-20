FROM node:12

WORKDIR /reactApp

COPY package*.json ./
RUN npm install

COPY . .

CMD [ "npm", "start" ]