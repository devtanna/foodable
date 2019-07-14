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

echo "json exported as datadump.json. Please run mongo import to atlas command manually."