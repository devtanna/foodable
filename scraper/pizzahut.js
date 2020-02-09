const puppeteer = require('puppeteer');
const cheerioReq = require('cheerio-req');
const slackBot = require('../devops/slackBot');
const settings = require('../settings')();
const parse = require('./parse_and_store/parse');
const locations = require(`./locations/partners/pizzahut.json`);

// logging init
const logger = require('../helpers/logging').getLogger();
// ########## START DB STUFF ####################
var db;
var dbClient;
// Initialize connection once at the top of the scraper
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(settings.DB_CONNECT_URL, { useNewUrlParser: true }, function(err, client) {
  if (err) throw err;
  db = client.db(settings.DB_NAME);
  dbClient = client;
  logger.info('... Connected to mongo! ... at: ' + settings.DB_CONNECT_URL);
});
// ########## END DB STUFF ####################

const scrapePage = (location, page) => {
  try {
    let result = [];

    return new Promise((resolve, reject) => {
      cheerioReq(location.url, (err, $) => {
        $('.product-card-holder').each(function(i) {
          let href = $('a[data-href]', this).prop('data-href');
          if (href) {
            href = `https://www.pizzahut.ae${href}`;
          } else {
            href = location.url;
          }

          let singleItem = {
            title: 'Pizza Hut',
            href,
            image: '/static/partners/pizzahut.webp',
            address: '',
            cuisine: 'Pizza, American',
            offer: $('.deal-item-name', this)
              .text()
              .trim(),
            description: $('.deal-item-desc', this)
              .text()
              .trim(),
            rating: '',
            votes: '',
            cost_for_two: '',
            source: 'pizzahut',
            slug: 'pizza-hut-partner',
            deliveryTime: null,
            deliveryCharge: null,
            minimumOrder: null,
            type: 'restaurant',
          };

          // if no offer, then skip
          if (singleItem.offer.length > 0) {
            singleItem['scoreLevel'] = 4;
            singleItem['scoreValue'] = 1;

            var index = result.indexOf(singleItem); // dont want to push duplicates
            if (index === -1) {
              result.push(singleItem);
            }
          } else {
            let cardText = $('a', this)
              .text()
              .trim();
            let found = result.find(r => cardText.includes(r.offer));
            if (found) {
              let regexMatchObject = cardText.match(/aed\s*(\d+(.\d+))/im);
              let price = regexMatchObject[0];
              let scoreValue = regexMatchObject && regexMatchObject[1] ? regexMatchObject[1] : 0;
              if (price) {
                if (price !== 'AED0.00') {
                  found.offer = `${found.offer} - ${price}`;
                  found.scoreValue = scoreValue * -1;
                }
              }
            }
          }
        });

        resolve(result);
      });
    });
  } catch (error) {
    logger.info(`Error in scrape ${error}`);
  }
};

const run = async () => {
  slackBot.sendSlackMessage(`Scraping Pizza Hut`);

  let args = settings.PUPPETEER_BROWSER_ARGS;

  let browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: args,
  });

  for (let i = 0; i < locations.length; i++) {
    let location = locations[i];

    browser.newPage().then(async page => {
      await page.setViewport(settings.PUPPETEER_VIEWPORT);

      try {
        let res = await scrapePage(location, page);
        if (res != undefined) {
          var flatResults = [].concat.apply([], res);
          let baselines = location.baseline;
          Object.entries(baselines).forEach(async ([CITY, baseline]) => {
            flatResults = flatResults.map(r => {
              return { ...r, location: baseline };
            });
            await parse.process_results(flatResults, db, CITY);
          });
        }
      } catch (e) {
        logger.error(`Error: ${e}`);
      }

      await page.close();
      browser.close();
      dbClient.close();
    });
  }
};

run();
