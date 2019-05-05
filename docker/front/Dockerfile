FROM node:latest
WORKDIR /src
COPY package.json /src
RUN npm install
COPY . /src
CMD npm run build && npm run start
EXPOSE 5000