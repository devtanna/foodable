const puppeteer = require('puppeteer');
const $ = require('cheerio');

const settings = require('../settings');
const utils = require('./utils');
const parse = require('./parse_and_store/parse');

// logging init
const logger = require('../helpers/logging').getLogger();
// ########## START DB STUFF ####################
var scraper_name = 'deliveroo';
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

let browser;
let page;

const getLocations = async () => {
  try {
    await page.goto('https://deliveroo.ae/sitemap');
    const html = await page.content();
    const links = $("h3:contains('Dubai')", html)
      .next('.sitemap--zones')
      .find('> li')
      .find('> a')
      .map((i, link) => {
        return {
          locationName: $(link).text(),
          url: $(link).prop('href'),
        };
      });

    return links;
  } catch (error) {
    logger.error('Error in sitemap fetch: ' + error);
  }
};

const scrapePage = async url => {
  try {
    await page.goto(
      `https://deliveroo.ae${url.url}?offer=all+offers`,
      settings.PUPPETEER_GOTO_PAGE_ARGS
    );
    await page.waitForSelector(
      'li[class*=HomeFeedGrid]:first-child span:first-child > div[style]'
    );

    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitFor(1000);

    const html = await page.content();
    let items = [];
    $('li[class*="HomeFeedGrid"]', html).each(function() {
      let img;
      try {
        img = $(this)
          .children('div')
          .children('div')
          .children('a')
          .children('span')
          .children('div')
          .css('background-image');
      } catch (err) {
        img = '';
      }

      let cuisine = [];
      $('span[class*="TagList"]', this).each(function() {
        cuisine.push(
          $(this)
            .text()
            .trim()
        );
      });

      let result = {
        title: $('div[class*="RestaurantCard"] span p', this)
          .eq(0)
          .text()
          .trim(),
        slug: utils.slugify(
          $('div[class*="RestaurantCard"] span p', this)
            .eq(0)
            .text()
            .trim()
        ),
        href: clean_deliveroo_href($('a', this).prop('href')),
        image: img,
        location: url.locationName,
        address: '',
        cuisine: cuisine.join(','),
        offer: $('div[class*="RestaurantCard"] span p', this)
          .eq(3)
          .text()
          .trim(),
        rating: $('span[class*="StarRating"]', this)
          .eq(2)
          .text()
          .trim(),
        votes: $('span[class*="RestaurantStarRating"]', this)
          .eq(4)
          .text()
          .trim(),
        source: `${scraper_name}`,
        cost_for_two: '',
        type: 'restaurant',
      };

      // meta fields
      result['score'] = utils.calculateScore(result);

      // if no offer, then skip
      if (result.offer.length > 0) {
        let obj = items.find(o => o.slug === result.slug);
        if (obj == undefined) {
          // dont want to push duplicates
          items.push(result);
        }
      }
    });

    return items;
  } catch (error) {
    logger.error('Error in data extract: ' + error);
  }
};

let data = [];

const run = async () => {
  browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: settings.PUPPETEER_BROWSER_ARGS,
  });
  page = await browser.newPage();
  await page.setViewport(settings.PUPPETEER_VIEWPORT);

  const links = await getLocations();
  if (links != null) {
    logger.info('Number of locations received: ' + links.length);
    for (let i = 0; i < links.length; i++) {
      logger.info('On scrape ' + i + ' / ' + links.length);

      try {
        if (settings.SCRAPER_TEST_MODE) {
          if (links[i].url.indexOf('karama') < 0) {
            continue;
          }
        }

        logger.info('Scraping: ' + links[i].url);
        let res = await scrapePage(links[i]);

        if (res != null) {
          var flatResults = [].concat.apply([], res);

          // this is an async call
          await parse.process_results(
            flatResults,
            db,
            dbClient,
            scraper_name,
            (batch = true)
          );
          logger.info('Scraped deliveroo. Results count: ' + res.length);
        }
      } catch (error) {
        logger.error('Error in overall fetch: ' + error);
      }
    }
  }

  await browser.close();
  // close the dbclient
  await dbClient.close();
  logger.info('Deliveroo Scrape Done!');
};

run();

function clean_deliveroo_href(input) {
  return input.replace(/time=[0-9]{4}$/, 'time=ASAP');
}
