const puppeteer = require('puppeteer');
const $ = require('cheerio');

const settings = require('../settings');
const utils = require('./utils');
const parse = require('./parse_and_store/parse');
// ########## START DB STUFF ####################
var scraper_name = 'zomato';
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
    console.log('... Zomato: Connected to mongo! ...');
  }
);
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
        image: $('.feat-img', this).css('background-image'),
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

      // meta fields
      singleItem['score'] = utils.calculateScore(singleItem);

      // if no offer, then skip
      if (singleItem.offer.length > 0) {
        var index = result.indexOf(singleItem); // dont want to push duplicates
        if (index === -1) {
          result.push(singleItem);
        }
      }
    });

    return { result, goNext: $('.paginator_item.next.item', html).length > 0 };
  } catch (error) {
    console.log(error);
  }
};

let hasNext = true;
let pageNum = 1;
let maxPage = 2; //200;
let data = [];

const run = async () => {
  browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: settings.PUPPETEER_BROWSER_ARGS,
  });

  page = await browser.newPage();
  await page.setViewport(settings.PUPPETEER_VIEWPORT);

  while (hasNext && pageNum <= maxPage) {
    console.log('zomato scraper: Starting page: ' + pageNum);
    let res = await scrapePage(pageNum);
    if (res != undefined) {
      data.push(res.result);
      if (res.goNext) {
        pageNum++;
      } else {
        hasNext = false;
      }
    } else {
      process.exit(1);
    }
  }
  // merge all pages results into one array
  var mergedResults = [].concat.apply([], data);

  await browser.close();
  console.log(
    'zomato scraper: Scraped ' +
      pageNum +
      ' pages. Results count: ' +
      mergedResults.length
  );

  parse.process_results(mergedResults, db, dbClient, scraper_name);
};

run();
