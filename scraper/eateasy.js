const puppeteer = require('puppeteer');
const $ = require('cheerio');
const performance = require('perf_hooks').performance;
const settings = require('../settings')();
const utils = require('./utils');
const parse = require('./parse_and_store/parse');
let links = require(`./locations/${process.argv[2]}/eateasy_locations.json`);
const slackBot = require('../devops/slackBot');
const slackLogBot = require('../devops/slackLogBot');

// logging init
const logger = require('../helpers/logging').getLogger();
// ########## START DB STUFF ####################
var scraper_name = 'eateasy';
var db;
var dbClient;
if (settings.ENABLE_EATEASY) {
  // Initialize connection once at the top of the scraper
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(settings.DB_CONNECT_URL, { useNewUrlParser: true }, function(err, client) {
    if (err) throw err;
    db = client.db(settings.DB_NAME);
    dbClient = client;
    logger.info('... Connected to mongo! ... at: ' + settings.DB_CONNECT_URL);
  });
}
// ########## END DB STUFF ####################

const scrapePage = async (page, location, city) => {
  try {
    await page.goto(location.url, settings.PUPPETEER_GOTO_PAGE_ARGS);

    let keepGoing = true;
    let index = 0;
    const MAX = 100;

    while (keepGoing && index < MAX) {
      await utils.delay(1000); // ! 5 second sleep per page
      logger.info('Scrolling page number: ' + index + ' in ' + location.locationName);
      let htmlBefore = await page.content();
      let offersCount = $('.restaurant-box', htmlBefore).length;
      await page.evaluate('window.scrollBy({ left: 0, top: document.body.scrollHeight, behavior: "smooth"});');
      await page.waitFor(1000);
      let htmlAfter = await page.content();
      let updatedOffersCount = $('.restaurant-box', htmlAfter).length;
      if (updatedOffersCount === offersCount) {
        keepGoing = false;
        break;
      }
      index++;
    }

    await page.waitFor(1000);

    let skippedCount = 0;

    const html = await page.content();
    let items = [];

    $('a.restaurant-box-inner', html).each(function() {
      let result = {
        title: $('.restaurant-box-desc h3', this)
          .text()
          .trim(),
        slug: utils.slugify(
          $('.restaurant-box-desc h3', this)
            .text()
            .trim()
        ),
        city: city,
        href: $(this).prop('href'),
        image: cleanImg($('.restaurant-box-logo img', this).prop('src')),
        location: location.baseline,
        address: $('.restaurant-box-desc .location', this)
          .text()
          .trim(),
        cuisine: $('.restaurant-box-desc .type', this)
          .text()
          .trim()
          .replace(/\n/g, '')
          .split('/')
          .join(','),
        offer: $('.restaurant-box-logo .tag-offer', this)
          .text()
          .trim(),
        rating: $('.tag-rating', this)
          .text()
          .trim(),
        votes: null,
        source: `${scraper_name}`,
        cost_for_two: '',
        deliveryTime: utils.getNumFromString(
          $('.delivery-columns li', this)
            .eq(2)
            .text()
            .trim()
        ),
        deliveryCharge: utils.getNumFromString(
          $('.delivery-columns li', this)
            .eq(1)
            .text()
            .trim()
        ),
        minimumOrder: utils.getNumFromString(
          $('.delivery-columns li', this)
            .eq(0)
            .text()
            .trim()
        ),
        type: 'restaurant',
      };

      // if no offer, then skip
      if (result.offer.length > 0) {
        let { scoreLevel, scoreValue } = utils.calculateScore(result);
        result['scoreLevel'] = scoreLevel;
        result['scoreValue'] = scoreValue;

        let obj = items.find(o => o.slug === result.slug);
        if (obj == undefined && scoreLevel !== -1) {
          // dont want to push duplicates
          items.push(result);
        }
      } else {
        skippedCount++;
      }
    });

    logger.info(`Skipped in ${location.locationName} = ${skippedCount}`);

    return items;
  } catch (error) {
    logger.error('Error in data extract: ' + error);
  }
};

const run = async () => {
  const city = process.argv[2];

  if (!settings.ENABLE_EATEASY) {
    logger.info('Eateasy scraper is DISABLED. EXITING.');
    process.exit();
  }
  slackBot.sendSlackMessage(`Eateasy started with arguments: ${process.argv.slice(2)}`);
  let browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: settings.PUPPETEER_BROWSER_ARGS,
  });

  if (links != null) {
    if (settings.SCRAPER_TEST_MODE) {
      links = links.slice(0, 4);
    }

    logger.info('Number of locations received: ' + links.length);
    let totalCount = 0;
    let yielded = false;
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
        slackBot.sendSlackMessage(`Eateasy Total Items Scraped: ${totalCount}`);
      }
      slackLogBot.sendLogFile('eateasy');
      logger.info('Eateasy Scrape Done!');
    };

    function* scrapeGenerator() {
      for (let i = 0; i < links.length; i++) {
        if (openPages.v >= settings.MAX_TABS) {
          yielded = true;
          yield i;
        }
        openPages.v++;
        let location = links[i];

        browser.newPage().then(async page => {
          await page.setViewport(settings.PUPPETEER_VIEWPORT);

          logger.info(`Scraping location: ${i + 1} / ${links.length} --- ${location.locationName} -- ${city}`);

          let items = await scrapePage(page, location, city);

          if (items != null) {
            logger.info(`Number of items scraped: ${items.length} in ${location.locationName}`);
            logger.info(`Baselines for ${location.locationName} are: ${location.baseline}`);

            let flatResults = [].concat.apply([], items);

            await parse.process_results(flatResults, db, city);
            totalCount += items.length;

            await page.close();
            openPages.v--;
          }
        });
      }
    }

    fdbGen.next();
  }
};

run();

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
