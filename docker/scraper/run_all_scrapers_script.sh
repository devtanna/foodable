#!/usr/bin/env bash
echo "---starting script---"
date
echo "---starting script---" >> /var/log/cron.log
date >> /var/log/cron.log
echo "-", "(1/12)"
node scraper/locations.js >> /var/log/cron.log
echo "--", "(2/12)"
node scraper/talabat.js >> /var/log/cron.log
echo "---", "(3/12)"
node scraper/reindex_offers.js >> /var/log/cron.log
echo "----", "(4/12)"
node scraper/ubereats.js >> /var/log/cron.log
echo "-----", "(5/12)"
node scraper/reindex_offers.js >> /var/log/cron.log
echo "------", "(6/12)"
node scraper/deliveroo.js >> /var/log/cron.log
echo "-------", "(7/12)"
node scraper/reindex_offers.js >> /var/log/cron.log
echo "--------", "(8/12)"
node scraper/carriage.js >> /var/log/cron.log
echo "---------", "(9/12)"
node scraper/reindex_offers.js >> /var/log/cron.log
echo "----------", "(10/12)"
node scraper/zomato.js >> /var/log/cron.log
echo "-----------", "(11/12)"
node scraper/reindex_offers.js >> /var/log/cron.log
echo "------------", "(12/12)"
date >> /var/log/cron.log
echo "---script done---" >> /var/log/cron.log
echo "---script done---"
date