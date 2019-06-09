#define the latest nodejs image  to build from
FROM node:latest
#create a working directory
WORKDIR /app
#copy package.json file under the working directory 
COPY package.json /app
#copy all your files under the working directory
COPY . /app
# install all the dependencies
RUN npm install && apt-get update && apt-get install -y vim-tiny && apt install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 ca-certificates fonts-liberation libappindicator1 libnss3 lsb-release xdg-utils wget && apt-get -y install cron

# Copy scraper-cron file to the cron.d directory
COPY docker/scraper/scraper-cron /etc/cron.d/scraper-cron

COPY docker/scraper/run_all_scrapers_script.sh .

# Give execution rights on the cron job
RUN chmod 0644 /etc/cron.d/scraper-cron && \
    chmod 777 ./run_all_scrapers_script.sh && \
    touch /var/log/cron.log && \
    crontab /etc/cron.d/scraper-cron && \
    sh ./run_all_scrapers_script.sh

# Run the command on container startup
CMD ["cron", "-f"]