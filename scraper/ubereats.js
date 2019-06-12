const puppeteer = require('puppeteer');
const $ = require('cheerio');
const settings = require('../settings');
const utils = require('./utils');
const parse = require('./parse_and_store/parse');

// logging init
var path = require('path');
const logger = require('../helpers/logging').getLogger();
// ########## START DB STUFF ####################
var scraper_name = 'ubereats';
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

async function scrapeInfiniteScrollItems(page, pageCount, scrollDelay = 1000) {
  let items = [];
  let pageNum = 0;
  try {
    let previousHeight;
    while (pageNum < pageCount) {
      logger.info('Scraping page: ' + pageNum);

      const html = await page.content();

      const listingsWithOffers = $('.base_ > div a', html);
      logger.info(
        'Number of offers on current page:',
        listingsWithOffers.length
      );
      try {
        listingsWithOffers.each(function() {
          if (
            $(this).find('.truncatedText_.ue-bz.ue-cq.ue-cp.ue-cr').length < 1
          )
            return;

          let result = {
            type: 'restaurant',
            source: `${scraper_name}`,
            slug: utils.slugify(
              $('.ue-ba.ue-bb.ue-bc.ue-bd.ue-c0.ue-c1.ue-ah.ue-ec', this)
                .text()
                .split('-')[0]
                .trim()
            ),
            title: $('.ue-ba.ue-bb.ue-bc.ue-bd.ue-c0.ue-c1.ue-ah.ue-ec', this)
              .text()
              .split('-')[0]
              .trim(),
            href: 'https://www.ubereats.com' + $(this).attr('href'),
            image: null,
            location: $(
              '.ue-ba.ue-bb.ue-bc.ue-bd.ue-c0.ue-c1.ue-ah.ue-ec',
              this
            )
              .text()
              .split('-')[1]
              .trim(), // TODO sometimes this is undefined
            rating: $(
              'div.ue-ei.ue-aj.ue-ej.ue-bc.ue-ek > div > span > span',
              this
            )
              .text()
              .trim(),
            cuisine: $('div.ue-bz.ue-cq.ue-cp.ue-cr', this)
              .text()
              .trim(),
            offer: $('.truncatedText_.ue-bz.ue-cq.ue-cp.ue-cr', this)
              .text()
              .trim(),
            deliveryTime: $(
              'div.ue-ei.ue-aj.ue-ej.ue-bc.ue-ek > div.ue-a6ue-ab',
              this
            )
              .text()
              .trim(),
            minimumOrder: null,
            deliveryCharge: null,
            cost_for_two: null,
            votes: $(
              'div.ue-ei.ue-aj.ue-ej.ue-bc.ue-ek > div > span:nth-child(2)',
              this
            ).text(),
            address: $('.ue-ba.ue-bb.ue-bc.ue-bd.ue-c0.ue-c1.ue-ah.ue-ec', this)
              .text()
              .split('-')[1],
          };

          // meta fields
          result['score'] = utils.calculateScore(result);

          // if no offer, then skip
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
      pageNum++;
    }
  } catch (error) {
    logger.error(error);
  }

  logger.info('Scraped total items:', items.length);

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

  let giantResultsObj = [];

  try {
    // Navigate to the page.
    await page.goto(
      'https://www.ubereats.com/en-AE/dubai/',
      settings.PUPPETEER_GOTO_PAGE_ARGS
    );

    // max number of pages to scroll through
    if (settings.SCRAPER_TEST_MODE) {
      var maxPage = 2;
    } else {
      var maxPage = 25;
    }
    // Scroll and extract items from the page.
    let res = await scrapeInfiniteScrollItems(page, maxPage);

    var flatResults = [].concat.apply([], res);

    // this is an async call
    await parse.process_results(
      flatResults,
      db,
      dbClient,
      scraper_name,
      (batch = true)
    );
    logger.info('Scraped ubereats. Results count: ' + res.length);
  } catch (error) {
    logger.error(error);
  }

  // Close the browser.
  await browser.close();
  // close the dbclient
  await dbClient.close();
  logger.info('UberEats Scrape Done!');
})();
