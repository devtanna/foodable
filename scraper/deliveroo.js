const puppeteer = require('puppeteer');
const $ = require('cheerio');
const performance = require('perf_hooks').performance;
const settings = require('../settings')();
const utils = require('./utils');
const parse = require('./parse_and_store/parse');
let links = require('./deliveroo_locations.json');

// logging init
const logger = require('../helpers/logging').getLogger();
// ########## START DB STUFF ####################
var scraper_name = 'deliveroo';
var db;
var dbClient;
if (settings.ENABLE_DELIVEROO) {
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

const scrapePage = async (page, location) => {
  try {
    await page.goto(`https://deliveroo.ae${location.url}?offer=all+offers`, settings.PUPPETEER_GOTO_PAGE_ARGS);

    let keepGoing = true;
    let index = 0;
    const MAX = 100;

    while (keepGoing && index < MAX) {
      await utils.delay(1000); // ! 5 second sleep per page
      logger.info('Scrolling page number: ' + index + ' in ' + location.locationName);
      let htmlBefore = await page.content();
      let offersCount = $('li[class*="HomeFeedGrid"]', htmlBefore).length;
      await page.evaluate('window.scrollBy({ left: 0, top: document.body.scrollHeight, behavior: "smooth"});');
      await page.waitFor(1000);
      let htmlAfter = await page.content();
      let updatedOffersCount = $('li[class*="HomeFeedGrid"]', htmlAfter).length;
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
    let offersCount = $('li[class*="HomeFeedGrid"]', html).length;

    logger.info(`Number of available offers in ${location.locationName}: ${offersCount}`);

    $('a[class*="HomeFeedUICard"]', html).each(function() {
      let img;
      try {
        img = $(this)
          .children('span')
          .children('div')
          .css('background-image');
      } catch (err) {
        img = '';
      }

      let cuisine = [];
      let rating = null;
      let votes = null;
      $('li[class*="HomeFeedUICard"]', this)
        .eq(1)
        .children('span span')
        .each(function() {
          let el = $(this)
            .text()
            .trim();

          if (el === '' || el === '·') return;

          if (el.match(/\((\d+(.\d+)*)[+]*\)/g)) {
            votes = el.match(/(\d+(.\d+)*)/g)[0];
          } else if (el.match(/(\d+(.\d+)*)/g)) {
            rating = el.match(/(\d+(.\d+)*)/g)[0];
          } else if (el !== '' && el !== '·') {
            cuisine.push(el);
          }
        });

      let title = $('li[class*="HomeFeedUICard"] span p', this)
        .eq(0)
        .text()
        .trim();

      let offer = $('li[class*="HomeFeedUICard"]', this)
        .eq(-1)
        .children('span')
        .eq(2)
        .children('span')
        .text()
        .trim();

      let deliveryTimeP1 = $('span[class*="Bubble"]', this)
        .eq(1)
        .children('p')
        .text()
        .trim();
      let deliveryTimeP2 = $('span[class*="Bubble"]', this)
        .eq(2)
        .children('p')
        .text()
        .trim();
      let deliveryTime;
      if (deliveryTimeP2.toLowerCase() === 'min') {
        deliveryTime = `${deliveryTimeP1} ${deliveryTimeP2}`;
      } else {
        deliveryTime = `${deliveryTimeP2} ${deliveryTimeP1}`;
      }
      deliveryTime = deliveryTime.replace('min', '');

      let deliveryCharge = $('li[class*="HomeFeedUICard"]', this)
        .eq(-2)
        .children('span')
        .text()
        .trim();

      let result = {
        title,
        slug: utils.slugify(
          $('li[class*="HomeFeedUICard"] span p', this)
            .eq(0)
            .text()
            .trim()
        ),
        href: `https://deliveroo.ae${clean_deliveroo_href($(this).prop('href'))}`,
        image: cleanImg(img),
        location: location.baseline,
        address: '',
        cuisine: cuisine.join(', '),
        offer,
        rating,
        votes,
        source: `${scraper_name}`,
        cost_for_two: '',
        deliveryTime,
        minimumOrder: '?',
        deliveryCharge: getNumFromString(deliveryCharge),
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
  if (!settings.ENABLE_DELIVEROO) {
    logger.info('Deliveroo scraper is DISABLED. EXITING.');
    process.exit();
  }

  let browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: settings.PUPPETEER_BROWSER_ARGS,
  });

  if (links != null) {
    if (settings.SCRAPER_TEST_MODE) {
      links = links.slice(0, 4);
    }

    logger.info('Number of locations received: ' + links.length);

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
      } else if (val === 0 && fdbGen.next().done) {
        handleClose();
      }
    });

    const handleClose = () => {
      browser.close();
      dbClient.close();
      if (totalCount > 0) {
        logger.debug(`Total items scraped ${totalCount}`);
        slackBot.sendSlackMessage(`Deliveroo Total Items Scraped: ${totalCount}`);
      }
      logger.info('Deliveroo Scrape Done!');
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

          logger.info(`Scraping location: ${i + 1} / ${links.length} --- ${location.locationName}`);

          let t0 = performance.now();
          let items = await scrapePage(page, location);
          let t1 = performance.now();

          logger.debug(`Deliveroo scrapePage function call took: ${t1 - t0} msec.`);

          if (items != null) {
            logger.info(`Number of items scraped: ${items.length} in ${location.locationName}`);
            logger.info(`Baselines for ${location.locationName} are: ${location.baseline}`);

            let flatResults = [].concat.apply([], items);
            await parse.process_results(flatResults, db);
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

function clean_deliveroo_href(input) {
  return input.replace(/time=[0-9]{4}$/, 'time=ASAP');
}

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

function getNumFromString(str) {
  if (str) {
    const matchedNum = str.match(/[+-]?\d+(\.\d+)?/g);
    let num = matchedNum ? matchedNum[1] || matchedNum[0] : '0.00';
    if (+num < 10 && Number.isInteger(+num)) {
      num = parseInt(num).toFixed(2);
    }
    return num;
  } else return null;
}
