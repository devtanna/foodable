#!/usr/bin/env bash
echo "---starting script-----------------------------------------------" && date
echo $PWD && cd /home/foodablescraper/app/foodable && echo $PWD
export ENV='localhost'

node devops/slackBot.js "Starting Scraper"
wait

mongoexport --host localhost:27017,localhost:27017 --db foodabledb --collection collection_99_99_99 --type json --out backupdatadump.json
wait

sudo systemctl start mongodb
wait

sleep 5

node devops/slackBot.js "Cleaning Up DB"
wait

export NODE_PATH="$PWD/node_modules"
start=`date +%s`
echo "< dbclean ..." && node scraper/cleanup/dbClean.js && echo "... dbclean >" &&
wait

node devops/slackBot.js "Running Talabat 0 to 92"
wait

echo "< talabat ..." && node scraper/talabat.js 0 92 && echo "... talabat >" &&
wait

node devops/slackBot.js "Running Deliveroo"
wait

echo "< deliveroo ..." && node scraper/deliveroo.js && echo "... deliveroo >" &&
wait

node devops/slackBot.js "Running Carriage"
wait

echo "< carriage ..." && node scraper/carriage.js && echo "... carriage >" &&
wait

node devops/slackBot.js "Running Zomato"
wait

echo "< zomato ..." && node scraper/zomato.js && echo "... zomato >" &&
wait

node devops/slackBot.js "Running Talabat 93 to 184"
wait

echo "< talabat ..." && node scraper/talabat.js 93 184 && echo "... talabat >" &&
wait

node devops/slackBot.js "Running Re Index"
wait

node scraper/reindex.js
wait

node devops/slackBot.js "All Done"
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

sudo systemctl stop mongodb
wait

mongoimport --host foodable-Cluster0-shard-0/foodable-cluster0-shard-00-00-zyyjg.gcp.mongodb.net:27017,foodable-cluster0-shard-00-01-zyyjg.gcp.mongodb.net:27017,foodable-cluster0-shard-00-02-zyyjg.gcp.mongodb.net:27017 --ssl --username devtanna --password K4eh5Ds2MrDkAk5I --authenticationDatabase admin --db foodabledb --collection collection_99_99_99 --drop --type json --file datadump.json
wait

node devops/slackBot.js "Data Transported"
wait

echo "Data Transported"
wait

echo date >> /tmp/cron_timestamps.txt
wait
