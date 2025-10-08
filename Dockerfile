FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

Install application dependencies
This is fast because we use the cached layer from the Jenkins agent install
RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
