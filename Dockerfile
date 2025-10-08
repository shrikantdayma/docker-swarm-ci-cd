Use a lightweight Node.js base image
FROM node:18-alpine

Set the working directory inside the container
WORKDIR /app

Copy application files
COPY package*.json ./

Install application dependencies
RUN npm install

Copy the rest of the application source code
COPY . .

Expose the application port
EXPOSE 3000

Define the command to run the application
CMD ["node", "app.js"]
