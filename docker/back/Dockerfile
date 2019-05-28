#define the latest nodejs image  to build from
FROM node:latest
#create a working directory
WORKDIR /app
#copy package.json file under the working directory 
COPY package.json /app
#copy all your files under the working directory
COPY . /app
# install all the dependencies
RUN npm install && npm install nodemon -g && apt-get update && apt-get install -y vim-tiny
# expose the port 4000
EXPOSE 4000
# start nodejs server
CMD nodemon server.js