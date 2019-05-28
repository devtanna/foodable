FROM node:latest
WORKDIR /src
COPY package.json /src
COPY . /src
RUN npm install && apt-get update && apt-get install -y vim-tiny
CMD npm run build && npm run start
EXPOSE 5000