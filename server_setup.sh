#!/usr/bin/env bash
git clone git@gitlab.com:devtanna/foodable.git
sudo apt update
sudo apt install nginx
sudo ufw allow 'Nginx HTTP'
systemctl status nginx
sudo apt install npm
cd foodable
npm install
npm run build
sudo mkdir /etc/nginx/conf.d/
rm /etc/nginx/sites-enabled/default
sudo cp ~/foodable/docker/nginx/azure/azure_proxy.conf /etc/nginx/conf.d/
sudo systemctl restart nginx
npm run start-azure