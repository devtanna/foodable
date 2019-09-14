const puppeteer = require('puppeteer');
const devices = require('puppeteer/DeviceDescriptors');
const $ = require('cheerio');

const settings = require('../settings')();
const utils = require('./utils');
const parse = require('./parse_and_store/parse');

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

const scrapePage = async (location, page) => {
  try {
    const url = `${location.url}`;
    await page.goto(url, settings.PUPPETEER_GOTO_PAGE_ARGS);

    let keepGoing = true;
    let index = 0;
    const MAX = 40;

    while (keepGoing && index < MAX) {
      logger.info('Scrolling page number: ' + index + ' in ' + location.locationName);
      let htmlBefore = await page.content();
      let offersCount = $('.res_details__wrapper', htmlBefore).length;
      await page.evaluate('window.scrollBy({ left: 0, top: document.body.scrollHeight, behavior: "smooth"});');
      await utils.delay(1000);
      await page.waitFor(() => {
        function isInViewport(elem) {
          const bounding = elem.getBoundingClientRect();
          return (
            bounding.top >= 0 &&
            bounding.left >= 0 &&
            bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
          );
        }
        const el = document.querySelector('.row.white-bg.pl15.pr15.mb10');
        return !el || !isInViewport(el);
      });
      let htmlAfter = await page.content();
      let updatedOffersCount = $('.res_details__wrapper', htmlAfter).length;
      if (updatedOffersCount === offersCount && index > 3) {
        keepGoing = false;
        break;
      }
      index++;
    }

    let skippedCount = 0;
    const html = await page.content();

    let result = [];

    $('.res_details__wrapper', html).each(function() {
      let title = $('.res_details__title div', this)
        .text()
        .trim();

      let image = new URL(cleanImg($('.res_details__image_container div', this).css('background-image')));
      image.search = image.search.replace(/100/g, '200');
      image = image.toString();

      let singleItem = {
        title,
        href: $(this).prop('href'),
        image,
        location: location.baseline,
        address: location.baseline,
        cuisine: $('.res_details__cuisines', this)
          .text()
          .trim(),
        offer: $('.res_details__info span.nowrap', this)
          .text()
          .trim()
          .replace(/\./g, '')
          .split(' - ')[0],
        rating: $('.res_details__rating', this)
          .text()
          .trim(),
        votes: null,
        cost_for_two:
          utils.getNumFromString(
            $('.res_details__average_cost', this)
              .text()
              .trim()
          ) * 2,
        source: `${scraper_name}`,
        slug: utils.slugify(title),
        deliveryTime: utils.getNumFromString(
          $('.res_details__order_details', this)
            .text()
            .trim()
            .split('·')[0]
            .trim()
        ),
        deliveryCharge: '?',
        minimumOrder: utils.getNumFromString(
          $('.res_details__order_details', this)
            .text()
            .trim()
            .split('·')[1]
            .trim()
        ),
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

    return { result };
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
    const myProxy = 'socks5://localhost:9050';
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
        await page.emulate(devices['iPhone 6']);
        await page.setViewport(settings.PUPPETEER_VIEWPORT);

        try {
          logger.info('zomato scraper: Starting location: ' + location.locationName);
          let res = await scrapePage(location, page);
          if (res != undefined) {
            var flatResults = [].concat.apply([], res.result);

            await parse.process_results(flatResults, db, dbClient, scraper_name, (batch = true));

            logger.info(`zomato scraper: Results count: ${res.result.length} in ${location.locationName}`);
          }
        } catch (e) {
          logger.error(`Error: ${e}`);
        } finally {
          await page.close();
          openPages.v--;
        }
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
