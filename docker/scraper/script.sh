echo "---starting script---" >> /var/log/cron.log
date >> /var/log/cron.log
node scraper/locations.js >> /var/log/cron.log
node scraper/talabat.js >> /var/log/cron.log
node scraper/reindex_offers.js >> /var/log/cron.log
node scraper/ubereats.js >> /var/log/cron.log
node scraper/reindex_offers.js >> /var/log/cron.log
node scraper/deliveroo.js >> /var/log/cron.log
node scraper/reindex_offers.js >> /var/log/cron.log
node scraper/carriage.js >> /var/log/cron.log
node scraper/reindex_offers.js >> /var/log/cron.log
node scraper/zomato.js >> /var/log/cron.log
node scraper/reindex_offers.js >> /var/log/cron.log
date >> /var/log/cron.log
echo "---script done---" >> /var/log/cron.log