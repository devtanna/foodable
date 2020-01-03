const puppeteer = require('puppeteer');
const $ = require('cheerio');
const settings = require('../settings')();
const utils = require('./utils');
const parse = require('./parse_and_store/parse');
const urls = require(`./locations/${process.argv[4]}/talabat_locations.json`);
const slackBot = require('../devops/slackBot');
const slackLogBot = require('../devops/slackLogBot');
const SCRAPE_TIMING = process.argv[5] || 'morning';

const CATEGORIES_TO_SCRAPE = [
  { category: 'AED 20 Lunch', offerString: '20 Dhs Lunch', timing: ['morning', 'evening'] },
  { category: 'Holiday Feasting', offerString: 'Special Talabat Deal', timing: ['evening'] },
];

// logging init
const logger = require('../helpers/logging').getLogger();
// ########## START DB STUFF ####################
var scraper_name = 'talabat';
var db;
var dbClient;
// Initialize connection once at the top of the scraper
var MongoClient = require('mongodb').MongoClient;
var totalCount = 0;

if (settings.ENABLE_TALABAT) {
  MongoClient.connect(settings.DB_CONNECT_URL, { useNewUrlParser: true }, function(err, client) {
    if (err) throw err;
    db = client.db(settings.DB_NAME);
    dbClient = client;
    logger.info('... Connected to mongo! ... at: ' + settings.DB_CONNECT_URL);
  });
}
// ########## END DB STUFF ####################

async function scrapePage(location, page, city, offerString) {
  let items = [];
  let keepGoing = true;
  let index = 0;
  let skippedCount = 0;
  const MAX = 100;

  while (keepGoing && index < MAX) {
    logger.info('Scrolling page number: ' + index + ' in ' + location.locationName);
    let htmlBefore = await page.content();
    let offersCount = $('.rest-link', htmlBefore).length;
    await page.evaluate('window.scrollBy({ left: 0, top: document.body.scrollHeight, behavior: "smooth"});');
    await page.waitFor(1000);
    let htmlAfter = await page.content();
    let updatedOffersCount = $('.rest-link', htmlAfter).length;
    if (updatedOffersCount === offersCount && index > 3) {
      keepGoing = false;
      break;
    }
    index++;
  }

  const html = await page.content();
  const finalOffersCount = $('.rest-link', html).length;
  logger.info(`Offers count for ${location.locationName} = ${finalOffersCount}`);

  $('.rest-link', html).each(function() {
    let $ratingStarArr = $('.rating-img .rat-star', this)
      .attr('class')
      .split(' ');
    let starRatingClass = $ratingStarArr[$ratingStarArr.length - 1];
    let starRatingArr = starRatingClass.split('-');
    let starRating = Number(starRatingArr[starRatingArr.length - 1]) / 10;

    let cuisine = [];
    $('.cuisShow .ng-binding', this).each(function() {
      cuisine.push($(this).text());
    });
    let title = clean_talabat_title(
      $('.res-name', this)
        .text()
        .trim()
        .replace(/['"]+/g, '')
    );
    let rest_slug = utils.slugify(title);
    const _deliveryTime = $('span:contains("mins")', this)
      .text()
      .trim();
    const _deliveryCharge = $('span[ng-switch-when="0"]', this)
      .text()
      .trim();
    const _minimumOrder = $('span:contains("Min:")', this)
      .next()
      .text()
      .trim();
    let result = {
      title: title,
      branch: clean_talabat_branch(title),
      slug: rest_slug,
      city: city,
      href: 'https://www.talabat.com' + $(this).attr('href'),
      image: $('.valign-helper', this)
        .next()
        .prop('lazy-img')
        .split('?')
        .shift(),
      location: location.baseline,
      rating: starRating,
      cuisine: clean_talabat_cuisine(cuisine.join('')),
      offer: offerString,
      deliveryTime: utils.getNumFromString(_deliveryTime),
      minimumOrder: utils.getNumFromString(_minimumOrder),
      deliveryCharge: utils.getNumFromString(_deliveryCharge),
      cost_for_two: '', // no info on talabat
      votes: clean_talabat_votes(
        $('.rating-num', this)
          .text()
          .trim()
      ),
      source: `${scraper_name}`,
      address: '', // no info on talabat
      type: 'restaurant',
    };

    // if no offer, then skip
    if (result.offer.length > 0) {
      let { scoreLevel, scoreValue } = utils.calculateScore(result);
      result['scoreLevel'] = scoreLevel;
      result['scoreValue'] = scoreValue;
      var index = items.indexOf(result); // dont want to push duplicates
      if (index === -1) {
        items.push(result); // write to db
      }
    } else {
      skippedCount++;
    }
  });

  return { items, skippedCount };
}

function scrapeInfiniteScrollItems(location, logMsg, browser, openPages, city) {
  browser.newPage().then(page => {
    page.setViewport(settings.PUPPETEER_VIEWPORT);
    page
      .goto(`https://www.talabat.com/${location.url}`, settings.PUPPETEER_GOTO_PAGE_ARGS)
      .then(async () => {
        logger.info(logMsg);

        let items = [];
        let skippedCount = 0;
        let categoriesToScrape = CATEGORIES_TO_SCRAPE.filter(cat => cat.timing.includes(SCRAPE_TIMING));

        try {
          for (let i = 0; i < categoriesToScrape.length; i++) {
            if (i > 0) {
              let cat2Scrape = categoriesToScrape[i - 1];

              await page.evaluate(cat2Scrape => {
                Array.from(document.querySelectorAll('span'))
                  .filter(element => element.textContent === cat2Scrape.category)[0]
                  .click();
              }, cat2Scrape);

              await page.waitFor(1000);
            }

            let cat2Scrape = categoriesToScrape[i];

            await page.evaluate(cat2Scrape => {
              Array.from(document.querySelectorAll('span'))
                .filter(element => element.textContent === cat2Scrape.category)[0]
                .click();
            }, cat2Scrape);

            await page.waitFor(1000);

            let { items: offers, skippedCount: _skippedCount } = await scrapePage(
              location,
              page,
              city,
              cat2Scrape.offerString
            );

            skippedCount += _skippedCount;
            items.push(...offers);
          }

          totalCount += items.length > 0 ? items.length : 0;
          logger.info(`Number of items scraped: ${items.length} in ${location.locationName}`);
          logger.info(`Skipped in ${location.locationName} = ${skippedCount}`);

          let flatResults = [].concat.apply([], items);
          parse.process_results(flatResults, db, city).then(async () => {
            await page.close();
            openPages.v--;
          });
        } catch (error) {
          logger.error(`Error ${error}`);
          await page.close();
          openPages.v--;
        }
      })
      .catch(e => console.log(e));
  });
}

(async () => {
  const city = process.argv[4];

  if (!settings.ENABLE_TALABAT) {
    logger.info('Talabat scraper is DISABLED. EXITING.');
    process.exit();
  }

  slackBot.sendSlackMessage(`Talabat started with arguments: ${process.argv.slice(3)}`);

  let browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: settings.PUPPETEER_BROWSER_ARGS,
  });

  if (urls != null) {
    let start, end;
    if (settings.SCRAPER_TEST_MODE) {
      start = 0;
      end = 4;
    } else {
      start = process.argv[2];
      end = Math.min(process.argv[3], 180);
    }
    let locations = urls.slice(start, end + 1);
    logger.info(`Scraping locations range: [${start} - ${end}], count: ${locations.length}`);

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
        slackBot.sendSlackMessage(`Talabat Total Items Scraped: ${totalCount}`);
      }
      slackLogBot.sendLogFile('talabat');
      logger.info('Talabat Scrape Done!');
    };

    function* scrapeGenerator() {
      for (let i = 0; i < locations.length; i++) {
        if (openPages.v >= settings.MAX_TABS) {
          yielded = true;
          yield i;
        }
        openPages.v++;
        let location = locations[i];
        let logMsg = `Scraping location: ${i + 1} / ${locations.length} --- ${location.locationName} --- ${city}`;

        try {
          scrapeInfiniteScrollItems(location, logMsg, browser, openPages, city);
        } catch (e) {
          console.log(e);
        }
      }
    }

    fdbGen.next();
  }
})();

function clean_talabat_title(title) {
  return title
    .split(',')[0]
    .replace('Restaurant', '')
    .trim();
}

function clean_talabat_cuisine(input) {
  return input.replace(/,\s*$/, '');
}

function clean_talabat_votes(input) {
  if (input != null && input.match(/\d+/) != null && input.match(/\d+/).length > 0) {
    return input.match(/\d+/)[0];
  } else {
    return '';
  }
}

function clean_talabat_rating(input) {
  if (input != null && input.match(/\d+/) != null && input.match(/\d+/).length > 0) {
    return input.match(/\d+/)[0];
  } else {
    return '';
  }
}

function clean_talabat_branch(title) {
  var branch = title.split(',')[1];
  if (branch != undefined && branch.length > 0) {
    return branch.trim();
  }
  return '';
}
