FROM node:latest
WORKDIR /src
COPY package.json /src
RUN npm install && apt-get update && apt-get install -y vim
COPY . /src
CMD npm run build && npm run start
EXPOSE 5000