const puppeteer = require('puppeteer');
const $ = require('cheerio');

const settings = require('../settings')();
const utils = require('./utils');
const parse = require('./parse_and_store/parse');
const fetch = require('isomorphic-unfetch');
const ZOMATO_API_KEY = '35a79084d91ab22692d3da87957f3685';

let locationsJson = require('./zomato_locations.json');

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

    let listingItems = $('.search-o2-card', html);

    for (let i = 0; i < listingItems.length; i++) {
      let listing = listingItems[i];

      let href = $('.result-order-flow-title', listing).prop('href');
      let urlObj = new URL(href);
      let resId = urlObj.searchParams.get('res_id');

      let zomatoRestaurant = await getZomatoRestaurant(resId);

      let orderUrl = new URL(zomatoRestaurant['order_url']);
      orderUrl.search = '';
      let trueHref = orderUrl.toString();

      let title = zomatoRestaurant['name'];

      let singleItem = {
        title,
        image: zomatoRestaurant['thumb'],
        href: trueHref,
        location: location.baseline,
        address: location.baseline,
        cuisine: zomatoRestaurant['cuisines'],
        offer: $('.offer-text', listing)
          .text()
          .trim()
          .replace(/\./g, ''),
        rating: zomatoRestaurant['user_rating']['aggregate_rating'],
        votes: zomatoRestaurant['user_rating']['votes'],
        cost_for_two: zomatoRestaurant['average_cost_for_two'],
        source: `${scraper_name}`,
        slug: utils.slugify(title),
        deliveryTime: utils.getNumFromString(
          $('.description div', listing)
            .eq(3)
            .text()
            .trim()
            .split('·')[1]
            .trim()
        ),
        deliveryCharge: '?',
        minimumOrder: utils.getNumFromString(
          $('.description div', listing)
            .eq(3)
            .text()
            .trim()
            .split('·')[0]
            .trim()
        ),
        type: 'restaurant',
      };

      // if no offer, then skip
      if (singleItem.offer.length > 0) {
        let { scoreLevel, scoreValue } = utils.calculateScore(singleItem);
        singleItem['scoreLevel'] = scoreLevel;
        singleItem['scoreValue'] = scoreValue;

        var index = result.indexOf(singleItem); // dont want to push duplicates
        if (index === -1) {
          result.push(singleItem);
        }
      } else {
        skippedCount++;
      }
    }

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
    const myProxy = 'socks5://111.223.75.178:8888'; //await utils.getProxy();
    if (myProxy && myProxy.length > 0) {
      args.push(`--proxy-server=${myProxy}`);
    }
  }

  let browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: args,
  });

  let start, end;
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
            logger.info('zomato scraper: Starting page: ' + pageNum + ' in ' + location.locationName);
            let res = await scrapePage(location, page, pageNum);
            if (res != undefined) {
              var flatResults = [].concat.apply([], res.result);

              await parse.process_results(flatResults, db, dbClient, scraper_name, (batch = true));

              logger.info(
                `zomato scraper: Scraped ${pageNum} pages. Results count: ${res.result.length} in ${
                  location.locationName
                }`
              );

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

const TIMEOUT_MS = 10000;

const endpoints = {
  getZomatoRestaurant: resId => `https://developers.zomato.com/api/v2.1/restaurant?res_id=${resId}`,
};

function getHeaders() {
  return {
    Accept: 'application/json',
    'Content-type': 'application/json',
  };
}

function timeoutPromise(promise) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('promise timeout'));
    }, TIMEOUT_MS);
    promise.then(
      res => {
        clearTimeout(timeoutId);
        resolve(res);
      },
      err => {
        clearTimeout(timeoutId);
        reject(err);
      }
    );
  });
}

async function request(path, method = 'GET', body = {}, headers = {}) {
  const options = {
    method: method,
    headers: Object.assign({}, getHeaders(), headers),
    credentials: 'same-origin',
  };

  if (method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  try {
    let res = await timeoutPromise(fetch(path, options));
    let data = await res.json();
    if (!res.ok) {
      let message = data.message || 'Something went wrong, please try again.';
      return Promise.reject({ message });
    }
    return data;
  } catch (error) {
    return Promise.reject({
      message: 'Something went wrong, please try again.',
    });
  }
}

function getZomatoRestaurant(res_id) {
  let header = {
    'user-key': ZOMATO_API_KEY,
  };
  return request(endpoints['getZomatoRestaurant'](res_id), 'GET', {}, header);
}
