#!/usr/bin/env bash

docker start mongo
wait

# drop the collection to start from clean slate
mongo foodabledb --eval 'db.collection_99_99_99.drop()'
wait

# run all scrapers
sh ./docker_run_all_scrapers_script.sh
wait

# export to json
mongoexport --host localhost:27017,localhost:27017 --db foodabledb --collection collection_99_99_99 --type json --out datadump.json
wait

# send it to atlas - DROPS collection FIRST!!!
mongoimport --host foodable-Cluster0-shard-0/foodable-cluster0-shard-00-00-zyyjg.gcp.mongodb.net:27017,foodable-cluster0-shard-00-01-zyyjg.gcp.mongodb.net:27017,foodable-cluster0-shard-00-02-zyyjg.gcp.mongodb.net:27017 --ssl --username devtanna --password K4eh5Ds2MrDkAk5I --authenticationDatabase admin --db foodabledb --collection collection_99_99_99 --drop --type json --file datadump.json
wait

rm datadump.json 2> /dev/null