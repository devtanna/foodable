const puppeteer = require('puppeteer');
const $ = require('cheerio');
var locations = require('./carriage_locations.json');

const settings = require('../settings')();
const utils = require('./utils');
const parse = require('./parse_and_store/parse');

// logging init
const logger = require('../helpers/logging').getLogger();
// ########## START DB STUFF ####################
var scraper_name = 'carriage';
var db;
var dbClient;
// Initialize connection once at the top of the scraper
if (settings.ENABLE_CARRIAGE) {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(settings.DB_CONNECT_URL, { useNewUrlParser: true }, function(err, client) {
    if (err) throw err;
    db = client.db(settings.DB_NAME);
    dbClient = client;
    logger.info('... Connected to mongo! ... at: ' + settings.DB_CONNECT_URL);
  });
}
// ########## END DB STUFF ####################

async function scrapeInfiniteScrollItems(page, location) {
  let items = [];
  try {
    await page.evaluate('$("#specialoffers").click()');
    await page.waitFor(4000);

    let keepGoing = true;
    let index = 0;
    const MAX = 100;

    while (keepGoing && index < MAX) {
      await utils.delay(3000); // ! 3 second sleep per page
      logger.info('Scraping page number: ' + index + ' in ' + location.locationName);
      let htmlBefore = await page.content();
      let offersCount = $('.restaurant-item', htmlBefore).length;
      await page.evaluate('window.scrollBy({ left: 0, top: document.body.scrollHeight, behavior: "smooth"});');
      await page.waitFor(4000);
      let htmlAfter = await page.content();
      let updatedOffersCount = $('.restaurant-item', htmlAfter).length;
      if (updatedOffersCount === offersCount) {
        keepGoing = false;
        break;
      }
      index++;
    }

    await page.waitFor(1000);

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
          href: 'https://www.trycarriage.com/en/ae/' + $('a:first-child', this).prop('href'),
          slug: utils.slugify(
            $('.rest-name-slogan h3', this)
              .text()
              .trim()
          ),
          image: $('.rest-cover', this)
            .css('background-image')
            .split(/"/)[1],
          location: location.baseline,
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

        if (result.offer.length > 0) {
          let { scoreLevel, scoreValue } = utils.calculateScore(result);
          result['scoreLevel'] = scoreLevel;
          result['scoreValue'] = scoreValue;

          var index = items.indexOf(result); // dont want to push duplicates
          if (index === -1) {
            items.push(result);
          }
        }
      });
    } catch (error) {
      logger.error(`Error in offer building ${error}`);
    }
  } catch (e) {
    logger.error(`Error in scrape ${e}`);
  }
  logger.info('number of items scraped: ' + items.length);
  return items;
}

(async () => {
  if (!settings.ENABLE_CARRIAGE) {
    logger.info('Carriage scraper is DISABLED. EXITING.');
    process.exit();
  }

  // Set up browser and page.
  const browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: settings.PUPPETEER_BROWSER_ARGS,
  });
  const page = await browser.newPage();
  page.setViewport(settings.PUPPETEER_VIEWPORT);

  if (settings.SCRAPER_TEST_MODE) {
    locations = locations.slice(0, 4);
  }

  var count = locations.length - 1;
  for (let i = 0; i < locations.length; i++) {
    await utils.delay(3000);
    logger.info('On location ' + i + ' / ' + locations.length);
    try {
      if (i > 0 && i % settings.SCRAPER_NUMBER_OF_MULTI_TABS == 0) {
        await utils.delay(settings.SCRAPER_SLEEP_BETWEEN_TAB_BATCH);
      }

      browser.newPage().then(page => {
        page.setViewport(settings.PUPPETEER_VIEWPORT);
        page
          .goto(`https://www.trycarriage.com/en/ae/restaurants?area_id=${locations[i].id}`, { waitUntil: 'load' })
          .then(() => {
            logger.info('Scraping location: ' + locations[i].locationName);

            scrapeInfiniteScrollItems(page, locations[i]).then(res => {
              var flatResults = [].concat.apply([], res);
              parse.process_results(flatResults, db).then(() => {
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
            });
          });
      });
    } catch (error) {
      logger.error(`Error ${error}`);
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
    }
  }
})();
