const puppeteer = require('puppeteer');
const $ = require('cheerio');
var locations = require(`./locations/${process.argv[2]}/carriage_locations.json`);

const settings = require('../settings')();
const utils = require('./utils');
const parse = require('./parse_and_store/parse');
const slackBot = require('../devops/slackBot');
const slackLogBot = require('../devops/slackLogBot');

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
      await utils.delay(1000); // ! 3 second sleep per page
      logger.info('Scrolling page number: ' + index + ' in ' + location.locationName);
      let htmlBefore = await page.content();
      let offersCount = $('.restaurant-item', htmlBefore).length;
      await page.evaluate('window.scrollBy({ left: 0, top: document.body.scrollHeight, behavior: "smooth"});');
      await page.waitFor(1000);
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
          cuisine: null,
          offer: 'Special Carriage Offer',
          deliveryTime: $('.del-time em', this)
            .text()
            .trim()
            .replace('mins', ''),
          minimumOrder: '?',
          deliveryCharge: '?',
          cost_for_two: '',
          votes: '',
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
  slackBot.sendSlackMessage(`Carriage started with arguments: ${process.argv.slice(2)}`);
  // Set up browser and page.
  const browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: settings.PUPPETEER_BROWSER_ARGS,
  });

  if (settings.SCRAPER_TEST_MODE) {
    locations = locations.slice(0, 4);
  }

  logger.info('Number of locations received: ' + locations.length);

  let yielded = false;
  let totalCount = 0;
  let fdbGen = scrapeGenerator();

  const openPages = {
    value: 0,
    listener: val => {},
    set v(val) {
      this.value = val;
      this.listener(val);
    },
    get v() {
      return this.value;
    },
    registerListener: function(l) {
      this.listener = l;
    },
  };

  openPages.registerListener(function(val) {
    if (val > 0 && val < settings.MAX_TABS && yielded) {
      yielded = false;
      let res = fdbGen.next();
    } else if (val <= 0 && fdbGen.next().done) {
      handleClose();
    }
  });

  const handleClose = () => {
    browser.close();
    dbClient.close();
    if (totalCount > 0) {
      logger.debug(`Total items scraped ${totalCount}`);
      slackBot.sendSlackMessage(`Carriage Total Items Scraped: ${totalCount}`);
    }
    slackLogBot.sendLogFile('carriage');
    logger.info('Carriage Scrape Done!');
  };

  function* scrapeGenerator() {
    for (let i = 0; i < locations.length; i++) {
      if (openPages.v >= settings.MAX_TABS) {
        yielded = true;
        yield i;
      }
      openPages.v++;
      let location = locations[i];
      let city = process.argv[2];
      browser.newPage().then(async page => {
        await page.setViewport(settings.PUPPETEER_VIEWPORT);

        try {
          await page.goto(`https://www.trycarriage.com/en/ae/restaurants?area_id=${location.id}`, {
            waitUntil: 'load',
            timeout: 35000,
          });

          logger.info(`Scraping location: ${i + 1} / ${locations.length} --- ${location.locationName}`);

          let items = await scrapeInfiniteScrollItems(page, location);
          totalCount += items.length;
          logger.info(`Number of items scraped: ${items.length} in ${location.locationName}`);
          logger.info(`Baselines for ${location.locationName} are: ${location.baseline}`);

          let flatResults = [].concat.apply([], items);

          await parse.process_results(flatResults, db, city);

          await page.close();
          openPages.v--;
        } catch (error) {
          logger.error(error);
          await page.close();
          openPages.v--;
        }
      });
    }
  }

  fdbGen.next();
})();
