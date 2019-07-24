#!/usr/bin/env bash
git clone git@gitlab.com:devtanna/foodable.git
sudo apt update
sudo apt install nginx
sudo ufw allow 'Nginx HTTP'
systemctl status nginx
sudo apt install npm
cd foodable
# so we dont have to run sudo on npm i
sudo chown -R $USER:$(id -gn $USER) /home/foodableae/.config
npm install
npm run build
sudo mkdir /etc/nginx/conf.d/
rm /etc/nginx/sites-enabled/default
sudo cp ~/foodable/docker/nginx/azure/azure_proxy.conf /etc/nginx/conf.d/
sudo systemctl restart nginx
npm run start-azure
# puppeteer setup
sudo apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget
# mongo setup
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 9DA31620334BD75D9DCB49F368818C72E52529D4
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo service mongod start