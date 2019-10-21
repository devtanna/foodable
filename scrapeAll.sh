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

node scraper/cleanup/dbClean.js
wait

/usr/bin/timeout -k 45m 46m node scraper/talabat.js 0 90 dxb
wait

/usr/bin/timeout -k 45m 46m node scraper/deliveroo.js dxb
wait

/usr/bin/timeout -k 45m 46m node scraper/eateasy.js dxb
wait

/usr/bin/timeout -k 45m 46m node scraper/carriage.js dxb
wait

/usr/bin/timeout -k 45m 46m node scraper/talabat.js 91 180 dxb
wait

# sudo systemctl restart tor
# wait

/usr/bin/timeout -k 45m 46m node scraper/zomato.js 0 44 dxb
wait

/usr/bin/timeout -k 45m 46m node scraper/zomato.js 45 87 dxb
wait

####################### SHJ!!!!!!!!!
/usr/bin/timeout -k 45m 46m node scraper/talabat.js 0 50 shj
wait

/usr/bin/timeout -k 45m 46m node scraper/zomato.js 0 34 shj
wait

/usr/bin/timeout -k 45m 46m node scraper/talabat.js 51 99 shj
wait

/usr/bin/timeout -k 45m 46m node scraper/eateasy.js shj
wait

####################### SHJ!!!!!!!!!

node scraper/reindex.js dxb
wait

node scraper/reindex.js shj
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

pkill -f -- "chromium-browser --type=renderer" &&
pkill chrome &&
pkill chromium &&
pkill -f chromium &&
pkill -f puppeteer &&
kill $(ps aux | grep 'puppet' | awk '{print $2}')
wait