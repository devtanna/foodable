const puppeteer = require('puppeteer');
const $ = require('cheerio');
const ObjectsToCsv = require('objects-to-csv');
const locations = require('./carriage_locations.json');

const settings = require('../settings');
const utils = require('./utils');
const parse = require('./parse_and_store/parse');

// logging init
const logger = require('../helpers/logging').getLogger();
// ########## START DB STUFF ####################
var scraper_name = 'carriage';
var db;
var dbClient;
// Initialize connection once at the top of the scraper
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(
  settings.DB_CONNECT_URL,
  { useNewUrlParser: true },
  function(err, client) {
    if (err) throw err;
    db = client.db(settings.DB_NAME);
    dbClient = client;
    logger.info('... Connected to mongo! ...');
  }
);
// ########## END DB STUFF ####################

function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function scrapeInfiniteScrollItems(
  page,
  pageCount,
  scrollDelay = 1000,
  location
) {
  let items = [];
  let pageNum = 0;
  try {
    let previousHeight;

    await page.evaluate('$("#specialoffers").click()');
    await page.waitFor(4000);

    while (pageNum < pageCount) {
      logger.info('Scraping page number: ' + pageNum);

      const html = await page.content();

      const listingsWithOffers = $('.restaurant-item', html);

      logger.info('Got number of offers: ' + listingsWithOffers.length);

      try {
        listingsWithOffers.each(function() {
          let result = {
            title: $('.rest-name-slogan h3', this)
              .text()
              .trim(),
            type: 'restaurant',
            source: `${scraper_name}`,
            href:
              'https://www.trycarriage.com/en/ae/' +
              $('a:first-child', this).prop('href'),
            slug: utils.slugify(
              $('.rest-name-slogan h3', this)
                .text()
                .trim()
            ),
            image: $('.rest-cover', this)
              .css('background-image')
              .split(/"/)[1],
            location: utils.slugify(location.name),
            rating: null,
            cuisine: $('.rest-name-slogan p', this)
              .text()
              .trim(),
            offer: 'Special Offer',
            deliveryTime: $('.del-time em', this)
              .text()
              .trim(),
            minimumOrder: null,
            deliveryCharge: null,
            cost_for_two: null,
            votes: null,
            address: location.name,
          };

          // meta fields
          result['score'] = utils.calculateScore(result);

          if (result.offer.length > 0) {
            var index = items.indexOf(result); // dont want to push duplicates
            if (index === -1) {
              items.push(result);
            }
          }
        });
      } catch (error) {
        logger.error(error);
      }

      // scroll to next page
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(
        `document.body.scrollHeight > ${previousHeight}`,
        { timeout: scrollDelay }
      );
      await page.waitFor(scrollDelay);

      if (items.length === listingsWithOffers.length) break;

      pageNum++;
    }
  } catch (e) {
    logger.error(e);
  }
  logger.info('number of items scraped: ' + items.length);
  return items;
}

(async () => {
  // Set up browser and page.
  const browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: settings.PUPPETEER_BROWSER_ARGS,
  });
  const page = await browser.newPage();
  page.setViewport(settings.PUPPETEER_VIEWPORT);

  var count = locations.length - 1;
  for (let i = 0; i < locations.length; i++) {
    logger.info('On location ' + i + ' / ' + locations.length);
    try {
      if (i > 0 && i % 5 == 0) {
        await sleep(8000);
      }

      browser.newPage().then(page => {
        page.setViewport(settings.PUPPETEER_VIEWPORT);
        page
          .goto(
            `https://www.trycarriage.com/en/ae/restaurants?area_id=${
              locations[i].id
            }`,
            { waitUntil: 'load' }
          )
          .then(() => {
            if (settings.SCRAPER_TEST_MODE) {
              var maxPage = 10;
            } else {
              var maxPage = 25;
            }
            logger.info('Scraping location:', locations[i].name);
            scrapeInfiniteScrollItems(page, maxPage, 1000, locations[i]).then(
              res => {
                var flatResults = [].concat.apply([], res);
                parse
                  .process_results(
                    flatResults,
                    db,
                    dbClient,
                    scraper_name,
                    (batch = true)
                  )
                  .then(() => {
                    count -= 1;
                    if (count < 0) {
                      logger.info('Closing browser');
                      // Close the browser.
                      browser.close();
                      logger.info('Closing client');
                      // close the dbclient
                      dbClient.close();
                      logger.info('Carriage Scrape Done!');
                    } else {
                      page.close();
                    }
                  });
              }
            );
          });
      });
    } catch (error) {
      logger.info('', error);
    }
  }
})();
