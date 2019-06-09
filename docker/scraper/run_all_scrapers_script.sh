#!/usr/bin/env bash
echo "---starting script---" && date && date >> /var/log/cron.log && echo "---starting script---" >> /var/log/cron.log &&
echo "< locations..." && node scraper/locations.js >> /var/log/cron.log && echo "... locations >"
wait

echo "< talabat ..." && node scraper/talabat.js >> /var/log/cron.log && echo "... talabat >" && node scraper/reindex_offers.js >> /var/log/cron.log &
echo "< ubereats ..." && node scraper/ubereats.js >> /var/log/cron.log && echo "... ubereats >" && node scraper/reindex_offers.js >> /var/log/cron.log &
echo "< deliveroo ..." && node scraper/deliveroo.js >> /var/log/cron.log && echo "... deliveroo >" && node scraper/reindex_offers.js >> /var/log/cron.log &
echo "< carriage ..." && node scraper/carriage.js >> /var/log/cron.log && echo "... carriage >" && node scraper/reindex_offers.js >> /var/log/cron.log &
echo "< zomato ..." && node scraper/zomato.js >> /var/log/cron.log && echo "... zomato >" && node scraper/reindex_offers.js >> /var/log/cron.log &

wait
date && date >> /var/log/cron.log
echo "---script done---" >> /var/log/cron.log && echo "---script done---"