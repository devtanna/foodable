const puppeteer = require('puppeteer');
const $ = require('cheerio');

const settings = require('../settings')();
const utils = require('./utils');
const parse = require('./parse_and_store/parse');

// logging init
const logger = require('../helpers/logging').getLogger();
// ########## START DB STUFF ####################
var scraper_name = 'zomato';
var db;
var dbClient;
// Initialize connection once at the top of the scraper
if (settings.ENABLE_ZOMATO) {
  var MongoClient = require('mongodb').MongoClient;
  MongoClient.connect(
    settings.DB_CONNECT_URL,
    { useNewUrlParser: true },
    function(err, client) {
      if (err) throw err;
      db = client.db(settings.DB_NAME);
      dbClient = client;
      logger.info('... Connected to mongo! ... at: ' + settings.DB_CONNECT_URL);
    }
  );
}
// ########## END DB STUFF ####################

let browser;
let page;

const scrapePage = async (pageNum = 1) => {
  try {
    const url = `https://www.zomato.com/dubai/restaurants?offers=1&page=${pageNum}`;
    await page.goto(url, settings.PUPPETEER_GOTO_PAGE_ARGS);
    const html = await page.content();
    let result = [];

    $('.search-result', html).each(function() {
      let cuisine = [];

      $('.search-page-text .nowrap a', this).each(function() {
        cuisine.push($(this).text());
      });

      var singleItem = {
        title: $('.result-title', this)
          .text()
          .trim(),
        href: $('.result-title', this).prop('href'),
        image: cleanImg($('.feat-img', this).prop('data-original')),
        location: $('.search_result_subzone', this)
          .text()
          .trim(),
        address: $('.search-result-address', this)
          .text()
          .trim(),
        cuisine: cuisine.join(','),
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
      }
    });

    return { result, goNext: $('.paginator_item.next.item', html).length > 0 };
  } catch (error) {
    logger.info(error);
  }
};

let hasNext = true;
let pageNum = 1;
let data = [];
var maxPage = settings.SCRAPER_MAX_PAGE('zomato');

const run = async () => {
  if (!settings.ENABLE_ZOMATO) {
    logger.info('Zomato scraper is DISABLED. EXITING.');
    process.exit();
  }

  browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: settings.PUPPETEER_BROWSER_ARGS,
  });

  page = await browser.newPage();
  await page.setViewport(settings.PUPPETEER_VIEWPORT);

  while (hasNext && pageNum <= maxPage) {
    logger.info('zomato scraper: Starting page: ' + pageNum);
    let res = await scrapePage(pageNum);
    if (res != undefined) {
      var flatResults = [].concat.apply([], res.result);

      // this is an async call
      await parse.process_results(
        flatResults,
        db,
        dbClient,
        scraper_name,
        (batch = true)
      );
      logger.info(
        'zomato scraper: Scraped ' +
          pageNum +
          ' pages. Results count: ' +
          res.result.length
      );

      if (res.goNext) {
        pageNum++;
      } else {
        hasNext = false;
      }
    } else {
      process.exit(1);
    }
  }

  await browser.close();
  // close the dbclient
  await dbClient.close();
  logger.info('Zomato Scrape Done!');
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
