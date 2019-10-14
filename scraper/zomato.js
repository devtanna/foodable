const puppeteer = require('puppeteer');
const $ = require('cheerio');

const slackBot = require('../devops/slackBot');
const settings = require('../settings')();
const utils = require('./utils');
const parse = require('./parse_and_store/parse');

const CITY = process.argv[4] || 'dxb';

let locationsJson = require(`./locations/${CITY}/zomato_locations.json`);

// logging init
const logger = require('../helpers/logging').getLogger();
// ########## START DB STUFF ####################
var scraper_name = 'zomato';
var db;
var dbClient;
// Initialize connection once at the top of the scraper
if (settings.ENABLE_ZOMATO) {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(settings.DB_CONNECT_URL, { useNewUrlParser: true }, function(err, client) {
    if (err) throw err;
    db = client.db(settings.DB_NAME);
    dbClient = client;
    logger.info('... Connected to mongo! ... at: ' + settings.DB_CONNECT_URL);
  });
}
// ########## END DB STUFF ####################

const scrapePage = async (location, page, pageNum = 1) => {
  try {
    const url = `${location.url}&page=${pageNum}`;
    await page.goto(url, settings.PUPPETEER_GOTO_PAGE_ARGS);

    let skippedCount = 0;
    const html = await page.content();

    let currentPage = parseInt(
      $('.pagination-number b', html)
        .eq(0)
        .text()
    );
    let totalPages = parseInt(
      $('.pagination-number b', html)
        .eq(1)
        .text()
    );

    logger.info(`${location.locationName}: ${currentPage} / ${totalPages}`);

    let result = [];
    let offersCount = $('.search-result', html).length;

    $('.search-result', html).each(function() {
      let cuisine = [];

      $('.search-page-text .nowrap a', this).each(function() {
        cuisine.push($(this).text());
      });

      var singleItem = {
        title: $('.result-title', this)
          .text()
          .trim(),
        href: $('.result-title', this).prop('href') + '/order',
        image: cleanImg($('.feat-img', this).prop('data-original')),
        location: location.baseline,
        address: location.baseline,
        city: CITY,
        cuisine: cuisine.join(', '),
        offer: $('.res-offers .zgreen', this)
          .text()
          .trim(),
        rating: $('.rating-popup', this)
          .text()
          .trim(),
        votes: $('[class^="rating-votes-div"]', this)
          .text()
          .trim(),
        cost_for_two: $('.res-cost span:nth-child(2)', this)
          .text()
          .trim(),
        source: `${scraper_name}`,
        slug: utils.slugify(
          $('.result-title', this)
            .text()
            .trim()
        ),
        deliveryTime: '?',
        deliveryCharge: '?',
        minimumOrder: '?',
        type: 'restaurant',
      };

      // if no offer, then skip
      if (singleItem.offer.length > 0) {
        let { scoreLevel, scoreValue } = utils.calculateScore(singleItem);
        singleItem['scoreLevel'] = scoreLevel;
        singleItem['scoreValue'] = scoreValue;

        let shouldAdd = scoreLevel !== 0 && scoreValue !== 0;

        var index = result.indexOf(singleItem); // dont want to push duplicates
        if (index === -1 && shouldAdd) {
          result.push(singleItem);
        }
      } else {
        skippedCount++;
      }
    });

    logger.info(`Skipped in ${location.locationName} = ${skippedCount}`);

    return { result, goNext: currentPage < totalPages };
  } catch (error) {
    logger.info(`Error in scrape ${error}`);
  }
};

const maxPage = settings.SCRAPER_MAX_PAGE('zomato');

const run = async () => {
  if (!settings.ENABLE_ZOMATO) {
    logger.info('Zomato scraper is DISABLED. EXITING.');
    process.exit();
  }

  let args = settings.PUPPETEER_BROWSER_ARGS;

  if (!settings.SCRAPER_TEST_MODE) {
    // const myProxy = 'socks5://54.37.209.37:80'; //await utils.getProxy();
    const myProxy = 'socks5://localhost:9050'; //await utils.getProxy();
    if (myProxy && myProxy.length > 0) {
      args.push(`--proxy-server=${myProxy}`);
    }
  }

  let browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: args,
  });

  let start, end;
  let totalCount = 0;
  if (settings.SCRAPER_TEST_MODE) {
    start = 0;
    end = 4;
  } else {
    start = process.argv[2];
    end = Math.min(process.argv[3], 87);
  }

  let locations = locationsJson.slice(start, end + 1);
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
    } else if (val === 0 && fdbGen.next().done) {
      handleClose();
    }
  });

  const handleClose = () => {
    browser.close();
    dbClient.close();
    if (totalCount > 0) {
      logger.debug(`Total items scraped ${totalCount}`);
      slackBot.sendSlackMessage(`Zomato Total Items Scraped: ${totalCount}`);
    }

    logger.info('Zomato Scrape Done!');
  };

  function* scrapeGenerator() {
    logger.info(`Scraping locations range: [${start} - ${end}], count: ${locations.length}`);

    for (let i = 0; i < locations.length; i++) {
      if (openPages.v >= settings.MAX_TABS) {
        yielded = true;
        yield i;
      }
      openPages.v++;
      let location = locations[i];

      logger.info(`Scraping location: ${i + 1} / ${locations.length} --- ${location.locationName}`);

      browser.newPage().then(async page => {
        await page.setViewport(settings.PUPPETEER_VIEWPORT);
        let hasNext = true;
        let pageNum = 1;

        while (hasNext && pageNum <= maxPage) {
          try {
            await utils.delay(1000);
            logger.info(
              'zomato scraper: Starting page: ' + pageNum + ' in ' + location.locationName + ' --- city: ' + CITY
            );
            let res = await scrapePage(location, page, pageNum);
            if (res != undefined) {
              var flatResults = [].concat.apply([], res.result);

              await parse.process_results(flatResults, db, CITY);

              logger.info(
                `zomato scraper: Scraped ${pageNum} pages. Results count: ${res.result.length} in ${
                  location.locationName
                }`
              );
              totalCount += res.result.length > 0 ? res.result.length : 0;

              if (res.goNext) {
                pageNum++;
              } else {
                hasNext = false;
              }
            }
          } catch (e) {
            logger.error(`Error: ${e}`);
          }
        }

        await page.close();
        openPages.v--;
      });
    }
  }

  fdbGen.next();
};

run();

function cleanImg(img) {
  let imgSrc = img;
  let hasImg = imgSrc !== '';

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
