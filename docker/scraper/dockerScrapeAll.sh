#!/usr/bin/env bash
echo "---starting script-----------------------------------------------" && date
echo $PWD && cd /app && echo $PWD
export ENV='localhost'
echo "" > /tmp/cronlog.txt

node devops/slackBot.js "Starting Scraper"
wait

service mongodb start
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

node devops/slackBot.js "Running dxb Talabat 0 to 90"
wait
echo "< talabat ..." && /usr/bin/timeout -k 45m 46m node scraper/talabat.js 0 90 dxb && echo "... talabat >" &&
wait

node devops/slackLogBot.js talabat
wait

node devops/slackBot.js "Running dxb Deliveroo"
wait
echo "< deliveroo ..." && /usr/bin/timeout -k 45m 46m node scraper/deliveroo.js dxb && echo "... deliveroo >" &&
wait

node devops/slackLogBot.js deliveroo
wait

node devops/slackBot.js "Running dxb Eateasy"
wait
echo "< eateasy ..." && /usr/bin/timeout -k 45m 46m node scraper/eateasy.js dxb && echo "... eateasy >" &&
wait

node devops/slackLogBot.js eateasy
wait

node devops/slackBot.js "Running dxb Carriage"
wait
echo "< carriage ..." && /usr/bin/timeout -k 45m 46m node scraper/carriage.js dxb && echo "... carriage >" &&
wait

node devops/slackLogBot.js carriage
wait

node devops/slackBot.js "Running dxb Talabat 91 to 180"
wait
echo "< talabat ..." && /usr/bin/timeout -k 45m 46m node scraper/talabat.js 91 180 dxb && echo "... talabat >" &&
wait

node devops/slackLogBot.js talabat
wait

node devops/slackBot.js "Running dxb Zomato 0 to 44"
wait
echo "< zomato ..." && /usr/bin/timeout -k 45m 46m node scraper/zomato.js 0 44 dxb && echo "... zomato >" &&
wait

node devops/slackLogBot.js zomato
wait

node devops/slackBot.js "Running Zomato 45 to 87"
wait
echo "< zomato ..." && /usr/bin/timeout -k 45m 46m node scraper/zomato.js 45 87 dxb && echo "... zomato >" &&
wait

node devops/slackLogBot.js zomato
wait

####################### SHJ!!!!!!!!!
node devops/slackBot.js "Running shj Talabat 0 to 50"
wait
echo "< talabat ..." && /usr/bin/timeout -k 45m 46m node scraper/talabat.js 0 50 shj && echo "... talabat >" &&
wait

node devops/slackBot.js "Running shj Zomato 0 to 34"
wait
echo "< zomato ..." && /usr/bin/timeout -k 45m 46m node scraper/zomato.js 0 34 shj && echo "... zomato >" &&
wait

node devops/slackBot.js "Running shj Talabat 51 to 99"
wait
echo "< talabat ..." && /usr/bin/timeout -k 45m 46m node scraper/talabat.js 51 99 shj && echo "... talabat >" &&
wait

node devops/slackBot.js "Running shj Eateasy"
wait
echo "< eateasy ..." && /usr/bin/timeout -k 45m 46m node scraper/eateasy.js shj && echo "... eateasy >" &&
wait

node devops/slackLogBot.js eateasy
wait
####################### SHJ!!!!!!!!!

node devops/slackBot.js "dxb Running Re Index"
wait
node scraper/reindex.js dxb
wait

node devops/slackBot.js "shj Running Re Index"
wait
node scraper/reindex.js shj
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

mongoimport --host foodable-Cluster0-shard-0/foodable-cluster0-shard-00-00-zyyjg.gcp.mongodb.net:27017,foodable-cluster0-shard-00-01-zyyjg.gcp.mongodb.net:27017,foodable-cluster0-shard-00-02-zyyjg.gcp.mongodb.net:27017 --ssl --username devtanna --password K4eh5Ds2MrDkAk5I --authenticationDatabase admin --db foodabledb --collection collection_99_99_99 --drop --type json --file datadump.json
wait

node devops/slackBot.js "Data Transported"
wait

echo "Data Transported"
wait

echo date >> /tmp/cron_timestamps.txt
wait

pkill -f -- "chromium-browser --type=renderer" &&
pkill chrome &&
pkill chromium &&
pkill -f chromium &&
pkill -f puppeteer &&
kill $(ps aux | grep 'node_modules' | awk '{print $2}')
wait