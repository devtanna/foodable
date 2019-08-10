const puppeteer = require('puppeteer');
const $ = require('cheerio');

const settings = require('../settings')();
const utils = require('./utils');
const parse = require('./parse_and_store/parse');
const urls = require('./talabat_locations.json');

// logging init
const logger = require('../helpers/logging').getLogger();
// ########## START DB STUFF ####################
var scraper_name = 'talabat';
var db;
var dbClient;
// Initialize connection once at the top of the scraper
var MongoClient = require('mongodb').MongoClient;

if (settings.ENABLE_TALABAT) {
  MongoClient.connect(settings.DB_CONNECT_URL, { useNewUrlParser: true }, function(err, client) {
    if (err) throw err;
    db = client.db(settings.DB_NAME);
    dbClient = client;
    logger.info('... Connected to mongo! ... at: ' + settings.DB_CONNECT_URL);
  });
}
// ########## END DB STUFF ####################

async function scrapeInfiniteScrollItems(page, url) {
  let items = [];

  try {
    await page.evaluate(() => {
      Array.from(document.querySelectorAll('span'))
        .filter(element => element.textContent === 'Offers')[0]
        .click();
    });

    await page.waitFor(3000);

    let keepGoing = true;
    let index = 0;
    const MAX = 100;

    while (keepGoing && index < MAX) {
      await utils.delay(1000); // ! 3 second sleep per page
      logger.info('Scraping page number: ' + index + ' in ' + url.locationName);
      let htmlBefore = await page.content();
      let offersCount = $('.rest-link', htmlBefore).length;
      await page.evaluate('window.scrollBy({ left: 0, top: document.body.scrollHeight, behavior: "smooth"});');
      await page.waitFor(1000);
      let htmlAfter = await page.content();
      let updatedOffersCount = $('.rest-link', htmlAfter).length;
      if (updatedOffersCount === offersCount) {
        keepGoing = false;
        break;
      }
      index++;
    }

    await page.waitFor(1000);

    const html = await page.content();

    $('.rest-link', html).each(function() {
      let $ratingImgSrc = $('.rating-img > img', this).attr('src');
      let starRating = $ratingImgSrc.match(new RegExp('rating-' + '(.*)' + '.svg'))[1];
      let cuisine = [];
      $('.cuisShow .ng-binding', this).each(function() {
        cuisine.push($(this).text());
      });
      let title = clean_talabat_title(
        $('.media-heading', this)
          .text()
          .trim()
          .replace(/['"]+/g, '')
      );
      let rest_slug = utils.slugify(
        clean_talabat_title(
          $('.media-heading', this)
            .text()
            .trim()
            .replace(/['"]+/g, '')
        )
      );
      let result = {
        title: clean_talabat_title(
          $('.media-heading', this)
            .text()
            .trim()
            .replace(/['"]+/g, '')
        ),
        branch: clean_talabat_branch(
          $('.media-heading', this)
            .text()
            .trim()
            .replace(/['"]+/g, '')
        ),
        slug: rest_slug,
        href: 'https://www.talabat.com' + $(this).attr('href'),
        image: $('.valign-helper', this)
          .next()
          .prop('lazy-img')
          .split('?')
          .shift(),
        location: url.baseline,
        rating: starRating,
        cuisine: clean_talabat_cuisine(cuisine.join('')),
        offer: $("div[ng-if='rest.offersnippet']", this)
          .text()
          .trim(),
        deliveryTime: $('span[ng-if="!showDeliveryRange || rest.dtim >= 120"]', this)
          .text()
          .trim(),
        minimumOrder: $('span:contains("Min:")', this)
          .next()
          .text()
          .trim(),
        deliveryCharge: $('span[ng-switch-when="0"]', this)
          .text()
          .trim(),
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
      }
    });
  } catch (e) {
    logger.error('Error during infinte page scrape: ' + e);
  }
  logger.info(`Number of items scraped: ${items.length} in ${url.locationName}`);
  logger.info(`Baselines for ${url.locationName} are: ${url.baseline}`);
  return items;
}

(async () => {
  if (!settings.ENABLE_TALABAT) {
    logger.info('Talabat scraper is DISABLED. EXITING.');
    process.exit();
  }

  browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: settings.PUPPETEER_BROWSER_ARGS,
  });

  if (urls != null) {
    let start, end;
    if (settings.SCRAPER_TEST_MODE) {
      start = 5;
      end = 8;
    } else {
      start = process.argv[2];
      end = Math.min(process.argv[3], 184);
    }
    let locations = urls.slice(start, end + 1);
    logger.info(`Scraping locations range: [${start} - ${end}], count: ${locations.length}`);

    await Promise.all(
      locations.map(async (url, i) => {
        await utils.delay(1000); // ! 5 second sleep so we dont trigger cloudflare.

        if (i > 0 && i % settings.SCRAPER_NUMBER_OF_MULTI_TABS == 0) {
          await utils.delay(settings.SCRAPER_SLEEP_BETWEEN_TAB_BATCH);
        }

        let page = await browser.newPage();
        page.setViewport(settings.PUPPETEER_VIEWPORT);

        try {
          await page.goto(`https://www.talabat.com/${url.url}`, settings.PUPPETEER_GOTO_PAGE_ARGS);
          logger.info('Scraping location: ' + url.url);

          let res = await scrapeInfiniteScrollItems(page, url);
          let flatResults = [].concat.apply([], res);

          await parse.process_results(flatResults, db);
          await page.close();

          logger.info('Locations processed: ' + (start + i) + '/' + end);
        } catch (error) {
          logger.info('', error);
        }
      })
    )
      .then(async () => {
        await browser.close();
        // close the dbclient
        await dbClient.close();
        logger.info('Talabat Scrape Done!');
      })
      .catch(e => logger.error(`Error: ${e}`));
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
