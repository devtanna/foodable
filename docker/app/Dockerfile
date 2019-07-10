FROM node:latest
WORKDIR /src
COPY package.json /src
COPY . /src
RUN npm install && npm install nodemon -g && apt-get update && apt-get install -y vim && npm run build
EXPOSE 4000
CMD ["npm","run","start"]