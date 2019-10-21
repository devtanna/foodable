#define the latest nodejs image  to build from
FROM ubuntu:18.04

RUN apt-get update && apt-get install -y apt-transport-https && apt-get install --yes curl && curl --silent --location https://deb.nodesource.com/setup_10.x | bash - && apt-get install --yes nodejs && apt-get install --yes build-essential

WORKDIR /app

COPY package.json /app
COPY docker/scraper/scraper-cron /etc/cron.d/scraper-cron
COPY . /app
COPY docker/scraper/dockerScrapeAll.sh /app

RUN npm install && apt-get update && apt install -y mongodb && apt install -y tor && apt-get install -y vim && apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget && apt-get -y install cron

RUN service tor start && service mongodb start \
    chmod 0644 /etc/cron.d/scraper-cron && \
    chmod 777 /app/dockerScrapeAll.sh && \
    chmod +x /app/dockerScrapeAll.sh && \
    touch /var/log/cron.log && \
    touch /tmp/cronlog.txt && \
    crontab /etc/cron.d/scraper-cron

# Run the command on container startup
CMD ["cron", "-f"]