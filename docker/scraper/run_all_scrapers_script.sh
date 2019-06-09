#!/usr/bin/env bash
export ENV="docker" && export NODE_PATH="/app/node_modules"
echo "---starting script---" && date && date >> /var/log/cron.log && echo "---starting script---" >> /var/log/cron.log &&
echo "< locations..." && /usr/local/bin/node /app/scraper/locations.js >> /var/log/cron.log && echo "... locations >"
wait

echo "< talabat ..." && /usr/local/bin/node /app/scraper/talabat.js >> /var/log/cron.log && echo "... talabat >" && /usr/local/bin/node /app/scraper/reindex_offers.js >> /var/log/cron.log &
echo "< ubereats ..." && /usr/local/bin/node /app/scraper/ubereats.js >> /var/log/cron.log && echo "... ubereats >" && /usr/local/bin/node /app/scraper/reindex_offers.js >> /var/log/cron.log &
echo "< deliveroo ..." && /usr/local/bin/node /app/scraper/deliveroo.js >> /var/log/cron.log && echo "... deliveroo >" && /usr/local/bin/node /app/scraper/reindex_offers.js >> /var/log/cron.log &
echo "< carriage ..." && /usr/local/bin/node /app/scraper/carriage.js >> /var/log/cron.log && echo "... carriage >" && /usr/local/bin/node /app/scraper/reindex_offers.js >> /var/log/cron.log &
echo "< zomato ..." && /usr/local/bin/node /app/scraper/zomato.js >> /var/log/cron.log && echo "... zomato >" && /usr/local/bin/node /app/scraper/reindex_offers.js >> /var/log/cron.log &

wait
date && date >> /var/log/cron.log
echo "---script done---" >> /var/log/cron.log && echo "---script done---"