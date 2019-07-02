const puppeteer = require('puppeteer');
const $ = require('cheerio');
const settings = require('../settings')();
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
if (settings.ENABLE_UBEREATS) {
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
}
// ########## END DB STUFF ####################

async function scrapeInfiniteScrollItems(page, pageCount, scrollDelay = 1000) {
  // await page.waitForSelector('div.base_');
  await page.waitFor(1000);

  let items = [];
  let pageNum = 0;
  try {
    let previousHeight;
    while (pageNum < pageCount) {
      logger.info('Scraping page: ' + pageNum);

      const html = await page.content();

      const listingsWithOffers = $('a.base_', html);

      console.log(
        'Number of offers on current page:',
        listingsWithOffers.length
      );

      try {
        listingsWithOffers.each(function() {
          let offer = $('span.truncatedText_', this)
            .text()
            .trim();

          if (!offer) return;

          let title = $('div', this)
            .children('div')
            .eq(1)
            .text()
            .trim();
          let cuisine = $('div', this)
            .children('div')
            .eq(2)
            .children('div')
            .eq(0)
            .text()
            .replace(/\$/g, '')
            .trim()
            .split('•')
            .filter(el => el !== '')
            .join(',')
            .trim();
          let location = title.split('-')[1] || '';

          let result = {
            title: title.split('-')[0].trim(),
            slug: utils.slugify(title.split('-')[0]).trim(),
            href: 'https://www.ubereats.com' + $(this).attr('href'),
            image: cleanImg(
              $('div', this)
                .children('div')
                .eq(0)
                .css('background-image') || ''
            ),
            location: location.trim(),
            address: location.trim(),
            cuisine: cuisine,
            offer: offer,
            rating: $("span[style*='font-family']", this)
              .eq(0)
              .text()
              .trim(),
            votes: $("span[style*='font-family']", this)
              .eq(1)
              .text()
              .replace(/\(|\)/g, '')
              .trim(),
            source: `${scraper_name}`,
            cost_for_two: '',
            type: 'restaurant',
          };

          // if no offer, then skip
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
        console.log('Error in getting result:', error);
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
    console.log('Scraping page error:', error);
  }

  logger.info('Scraped total items:', items.length);

  return items;
}

(async () => {
  if (!settings.ENABLE_UBEREATS) {
    logger.info('Ubereats scraper is DISABLED. EXITING.');
    process.exit();
  }

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
    var maxPage = settings.SCRAPER_MAX_PAGE('ubereats');

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
    console.log('Setup and scrape entry error:', error);
  }

  // Close the browser.
  await browser.close();
  // close the dbclient
  await dbClient.close();
  logger.info('UberEats Scrape Done!');
})();

function cleanImg(img) {
  let imgSrc = img;

  if (imgSrc) {
    if (imgSrc.includes('url("')) {
      imgSrc = imgSrc.replace('url("', '');
      imgSrc = imgSrc.slice(0, -2);
    } else if (imgSrc.includes('url(')) {
      imgSrc = imgSrc.replace('url(', '');
      imgSrc = imgSrc.slice(0, -1);
    }
  }

  return imgSrc;
}
