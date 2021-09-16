FROM node:14.10.1

# Create app directory
WORKDIR /usr/app

# Bundle app source
COPY ./package.json ./
RUN npm install
COPY . .
RUN npm run build
