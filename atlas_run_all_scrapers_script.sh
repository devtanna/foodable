#!/usr/bin/env bash
export ENV="localhost"
export MONGO_ENV="atlas"
export NODE_PATH="node_modules"
echo "---starting script---" && date &&

echo "< talabat ..." && /usr/local/bin/node scraper/talabat.js && echo "... talabat >" &&
wait

echo "< ubereats ..." && /usr/local/bin/node scraper/ubereats.js && echo "... ubereats >"  &&
wait

echo "< deliveroo ..." && /usr/local/bin/node scraper/deliveroo.js && echo "... deliveroo >" &&
wait

echo "< carriage ..." && /usr/local/bin/node scraper/carriage.js && echo "... carriage >" &&
wait

echo "< zomato ..." && /usr/local/bin/node scraper/zomato.js && echo "... zomato >" &&
wait

/usr/local/bin/node scraper/reindex2.js
wait

date
echo "---script done---"