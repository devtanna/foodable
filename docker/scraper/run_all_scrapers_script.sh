#!/usr/bin/env bash
echo "---starting script---"
date
echo "---starting script---" >> /var/log/cron.log
date >> /var/log/cron.log
echo "-"
node scraper/locations.js >> /var/log/cron.log
echo "--"
node scraper/talabat.js >> /var/log/cron.log
echo "---"
node scraper/reindex_offers.js >> /var/log/cron.log
echo "----"
node scraper/ubereats.js >> /var/log/cron.log
echo "-----"
node scraper/reindex_offers.js >> /var/log/cron.log
echo "------"
node scraper/deliveroo.js >> /var/log/cron.log
echo "-------"
node scraper/reindex_offers.js >> /var/log/cron.log
echo "--------"
node scraper/carriage.js >> /var/log/cron.log
echo "---------"
node scraper/reindex_offers.js >> /var/log/cron.log
echo "----------"
node scraper/zomato.js >> /var/log/cron.log
echo "-----------"
node scraper/reindex_offers.js >> /var/log/cron.log
echo "------------"
date >> /var/log/cron.log
echo "---script done---" >> /var/log/cron.log
echo "---script done---"
date