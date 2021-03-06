#!/usr/bin/env bash
echo "---starting script-----------------------------------------------" && date
echo $PWD && cd /home/foodableae/foodable && echo $PWD
export ENV='localhost'

echo "" > /tmp/cronlog.txt

node devops/slackBot.js "Starting Scraper"
wait

sudo service mongod start
wait

mongoexport --host localhost:27017,localhost:27017 --db foodabledb --collection collection_99_99_99 --type json --out backupdatadump.json
wait

sleep 5

node devops/slackBot.js "Cleaning Up DB"
wait

export NODE_PATH="$PWD/node_modules"
start=`date +%s`

echo "< dbclean ..." && node scraper/cleanup/dbClean.js && echo "... dbclean >" &&
wait

####################### DXB!!!!!!!!!
node devops/slackBot.js "Running dxb Talabat 0 to 180"
wait
echo "< talabat ..." &&
timeout -k 9m 10m node scraper/talabat.js 0 90 dxb $1 &
timeout -k 9m 10m node scraper/talabat.js 91 180 dxb $1 &&
echo "... talabat >" &&
wait
node devops/slackLogBot.js talabat
wait

node devops/slackBot.js "Running dxb Deliveroo"
wait
echo "< deliveroo ..." && timeout -k 9m 10m node scraper/deliveroo.js dxb && echo "... deliveroo >" &&
wait
node devops/slackLogBot.js deliveroo
wait

node devops/slackBot.js "Running dxb Eateasy"
wait
echo "< eateasy ..." && timeout -k 9m 10m node scraper/eateasy.js dxb && echo "... eateasy >" &&
wait
node devops/slackLogBot.js eateasy
wait

node devops/slackBot.js "Running dxb Carriage"
wait
echo "< carriage ..." && timeout -k 9m 10m node scraper/carriage.js dxb && echo "... carriage >" &&
wait
node devops/slackLogBot.js carriage
wait
####################### DXB!!!!!!!!!

####################### SHJ!!!!!!!!!
node devops/slackBot.js "Running shj Talabat 0 to 99"
wait
echo "< talabat ..." &&
timeout -k 9m 10m node scraper/talabat.js 0 50 shj $1 &
timeout -k 9m 10m node scraper/talabat.js 51 99 shj $1 &&
echo "... talabat >" &&
wait
node devops/slackLogBot.js talabat
wait

node devops/slackBot.js "Running shj Eateasy"
wait
echo "< eateasy ..." && timeout -k 9m 10m node scraper/eateasy.js shj && echo "... eateasy >" &&
wait
node devops/slackLogBot.js eateasy
wait
####################### SHJ!!!!!!!!!

####################### ABU DHABI!!!!!!!!!
node devops/slackBot.js "Running AD Talabat 0 to 81"
wait
echo "< talabat ..." &&
timeout -k 9m 10m node scraper/talabat.js 0 40 ad $1 &
timeout -k 9m 10m node scraper/talabat.js 41 81 ad $1 &&
echo "... talabat >" &&
wait
node devops/slackLogBot.js talabat
wait

node devops/slackBot.js "Running ABU DHABI Deliveroo"
wait
echo "< deliveroo ..." && timeout -k 9m 10m node scraper/deliveroo.js ad && echo "... deliveroo >" &&
wait
node devops/slackLogBot.js deliveroo
wait

node devops/slackBot.js "Running ABU DHABI Eateasy"
wait
echo "< eateasy ..." && timeout -k 9m 10m node scraper/eateasy.js ad && echo "... eateasy >" &&
wait
node devops/slackLogBot.js eateasy
wait

node devops/slackBot.js "Running ABU DHABI Carriage"
wait
echo "< carriage ..." && timeout -k 9m 10m node scraper/carriage.js ad && echo "... carriage >" &&
wait
node devops/slackLogBot.js carriage
wait
####################### ABU DHABI!!!!!!!!!

####################### ZOMATO!!!!!!!!!
node devops/slackBot.js "Running dxb Zomato 0 to 87"
wait
echo "< zomato ..." && timeout -k 9m 10m node scraper/zomato.js 0 87 dxb && echo "... zomato >" &&
wait
node devops/slackLogBot.js zomato
wait

node devops/slackBot.js "Running shj Zomato 0 to 34"
wait
echo "< zomato ..." && timeout -k 9m 10m node scraper/zomato.js 0 34 shj && echo "... zomato >" &&
wait
node devops/slackLogBot.js zomato
wait

node devops/slackBot.js "Running ABU DHABI Zomato 0 to 31"
wait
echo "< zomato ..." && timeout -k 9m 10m node scraper/zomato.js 0 31 ad && echo "... zomato >" &&
wait
node devops/slackLogBot.js zomato
wait
####################### ZOMATO!!!!!!!!!

node devops/slackBot.js "dxb Running Re Index"
wait
node scraper/reindex.js dxb
wait

node devops/slackBot.js "shj Running Re Index"
wait
node scraper/reindex.js shj
wait

node devops/slackBot.js "AD Running Re Index"
wait
node scraper/reindex.js ad
wait

node devops/slackLogBot.js reindex
wait

node devops/slackBot.js "All Scrapers Done"
wait
node devops/systemPing.js
wait
node devops/slackBot.js "Uploading to atlas..."
wait

mongoexport --host localhost:27017,localhost:27017 --db foodabledb --collection collection_99_99_99 --type json --out datadump.json
wait

echo "---script done------------------------------------------------------------" && date
end=`date +%s`
runtime=$((end-start))/86400
echo "$runtime" ns

sudo service mongod stop
wait

mongoimport --host foodable-Cluster0-shard-0/foodable-cluster0-shard-00-00-zyyjg.gcp.mongodb.net:27017,foodable-cluster0-shard-00-01-zyyjg.gcp.mongodb.net:27017,foodable-cluster0-shard-00-02-zyyjg.gcp.mongodb.net:27017 --ssl --username devtanna --password K4eh5Ds2MrDkAk5I --authenticationDatabase admin --db foodabledb --collection collection_99_99_99 --drop --type json --file datadump.json
wait

node devops/slackBot.js "Data Transported"
wait

echo "Data Transported"
wait

echo date >> /tmp/cron_timestamps.txt
wait

pkill -f -- "chromium-browser --type=renderer"
wait
pkill chrome
wait
pkill chromium
wait
pkill -f chromium
wait
pkill -f puppeteer
wait
kill $(ps aux | grep 'puppet' | awk '{print $2}')
wait