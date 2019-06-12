const puppeteer = require('puppeteer');
const $ = require('cheerio');

const settings = require('../settings');
const utils = require('./utils');
const parse = require('./parse_and_store/parse');

// logging init
const logger = require('../helpers/logging').getLogger();
// ########## START DB STUFF ####################
var scraper_name = 'talabat';
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

const getLocations = async page => {
  try {
    await page.goto('https://www.talabat.com/uae/sitemap');
    const html = await page.content();
    const links = $("h4:contains('Dubai')", html)
      .next('.row')
      .find('a')
      .map((i, link) => {
        return {
          locationName: $(link).text(),
          url: $(link).prop('href'),
        };
      });
    return links;
  } catch (error) {
    logger.error(error);
  }
};

async function scrapeInfiniteScrollItems(page, pageCount, scrollDelay = 1000) {
  let items = [];
  let pageNum = 0;
  try {
    let previousHeight;
    while (pageNum < pageCount) {
      const html = await page.content();
      // we get the location from the url
      const location = page.url().split('/')[6];
      await page.evaluate(() => {
        Array.from(document.querySelectorAll('span'))
          .filter(element => element.textContent === 'Offers')[0]
          .click();
      });

      $('.rest-link', html).each(function() {
        let cuisine = [];
        $('.cuisShow .ng-binding', this).each(function() {
          cuisine.push($(this).text());
        });

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
          slug: utils.slugify(
            clean_talabat_title(
              $('.media-heading', this)
                .text()
                .trim()
                .replace(/['"]+/g, '')
            )
          ),
          href: 'https://www.talabat.com' + $(this).attr('href'),
          image: $('.valign-helper', this)
            .next()
            .prop('lazy-img')
            .split('?')
            .shift(),
          location: location.trim(),
          rating: clean_talabat_rating($('.rating-num', this).prev().src),
          cuisine: clean_talabat_cuisine(cuisine.join('')),
          offer: $("div[ng-if='rest.offersnippet']", this)
            .text()
            .trim(),
          deliveryTime: $(
            'span[ng-if="!showDeliveryRange || rest.dtim >= 120"]',
            this
          )
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
      pageNum++;
      // scroll to next page
      previousHeight = await page.evaluate('document.body.scrollHeight');
      await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
      await page.waitForFunction(
        `document.body.scrollHeight > ${previousHeight}`,
        { timeout: scrollDelay }
      );
      await page.waitFor(scrollDelay);
    }
  } catch (e) {
    logger.error('', e);
  }
  logger.info(' number of items scraped: ' + items.length);
  return items;
}

(async () => {
  browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: settings.PUPPETEER_BROWSER_ARGS,
  });

  const page = await browser.newPage();
  await page.setViewport(settings.PUPPETEER_VIEWPORT);

  const urls = await getLocations(page);
  let giantResultsObj = [];
  if (urls != null) {
    logger.info(' Number of locations: ' + urls.length);
    for (let i = 0; i < urls.length; i++) {
      logger.info('Processing: ' + i + '/' + urls.length);
      let url = urls[i];

      if (settings.SCRAPER_TEST_MODE) {
        if (url['locationName'].toLowerCase() != 'al barsha 2') {
          continue;
        }
      }

      try {
        // Navigate to the page.
        logger.info(' Scraping location: ' + url.url);
        await page.goto(
          `https://www.talabat.com/${url.url}`,
          settings.PUPPETEER_GOTO_PAGE_ARGS
        );

        // max number of pages to scroll through
        if (settings.SCRAPER_TEST_MODE) {
          var maxPage = 2;
        } else {
          var maxPage = 5;
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

        logger.info(' processed count: ' + res.length);
      } catch (error) {
        logger.info('', error);
      }
    }
  }

  // Close the browser.
  await browser.close();

  // close the dbclient
  await dbClient.close();
  logger.info('Talabat Scrape Done!');
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
  if (
    input != null &&
    input.match(/\d+/) != null &&
    input.match(/\d+/).length > 0
  ) {
    return input.match(/\d+/)[0];
  } else {
    return '';
  }
}

function clean_talabat_rating(input) {
  if (
    input != null &&
    input.match(/\d+/) != null &&
    input.match(/\d+/).length > 0
  ) {
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
