#!/usr/bin/env bash
export ENV="docker" && export NODE_PATH="/app/node_modules"
echo "---starting script---" && date && date >> /var/log/cron.log && echo "---starting script---" >> /var/log/cron.log &&
#echo "< locations..." && /usr/local/bin/node /app/scraper/locations.js && echo "... locations >"
#wait

echo "< talabat ..." && /usr/local/bin/node /app/scraper/talabat.js && echo "... talabat >" &&
wait

echo "< ubereats ..." && /usr/local/bin/node /app/scraper/ubereats.js && echo "... ubereats >"  &&
wait

echo "< deliveroo ..." && /usr/local/bin/node /app/scraper/deliveroo.js && echo "... deliveroo >" &&
wait

echo "< carriage ..." && /usr/local/bin/node /app/scraper/carriage.js && echo "... carriage >" &&
wait

echo "< zomato ..." && /usr/local/bin/node /app/scraper/zomato.js && echo "... zomato >" &&
wait

/usr/local/bin/node /app/scraper/reindex2.js
wait

date && date >> /var/log/cron.log
echo "---script done---" >> /var/log/cron.log && echo "---script done---"