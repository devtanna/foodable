const puppeteer = require('puppeteer');
const $ = require('cheerio');

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

let browser;
let page;

const scrapePage = async url => {
  try {
    await page.goto(`https://deliveroo.ae${url.url}?offer=all+offers`, settings.PUPPETEER_GOTO_PAGE_ARGS);

    let keepGoing = true;
    let index = 0;
    const MAX = 100;

    while (keepGoing && index < MAX) {
      await utils.delay(3000); // ! 5 second sleep per page
      logger.info('Scraping page number: ' + index + ' in ' + url.url);
      let htmlBefore = await page.content();
      let offersCount = $('li[class*="HomeFeedGrid"]', htmlBefore).length;
      await page.evaluate('window.scrollBy({ left: 0, top: document.body.scrollHeight, behavior: "smooth"});');
      await page.waitFor(4000);
      let htmlAfter = await page.content();
      let updatedOffersCount = $('li[class*="HomeFeedGrid"]', htmlAfter).length;
      if (updatedOffersCount === offersCount) {
        keepGoing = false;
        break;
      }
      index++;
    }

    await page.waitFor(1000);

    const html = await page.content();
    let items = [];
    let offersCount = $('li[class*="HomeFeedGrid"]', html).length;

    logger.info(`Number of available offers: ${offersCount}`);

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

      let result = {
        title,
        slug: utils.slugify(
          $('li[class*="HomeFeedUICard"] span p', this)
            .eq(0)
            .text()
            .trim()
        ),
        href: clean_deliveroo_href($(this).prop('href')),
        image: cleanImg(img),
        location: url.baseline,
        address: '',
        cuisine: cuisine.join(', '),
        offer,
        rating,
        votes,
        source: `${scraper_name}`,
        cost_for_two: '',
        type: 'restaurant',
      };

      // if no offer, then skip
      if (result.offer.length > 0) {
        // console.log(">>>", result);
        let { scoreLevel, scoreValue } = utils.calculateScore(result);
        result['scoreLevel'] = scoreLevel;
        result['scoreValue'] = scoreValue;

        let obj = items.find(o => o.slug === result.slug);
        if (obj == undefined && scoreLevel !== -1) {
          // dont want to push duplicates
          items.push(result);
        }
      }
    });
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

  browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: settings.PUPPETEER_BROWSER_ARGS,
  });
  page = await browser.newPage();
  await page.setViewport(settings.PUPPETEER_VIEWPORT);

  if (links != null) {
    if (settings.SCRAPER_TEST_MODE) {
      links = links.slice(0, 2);
    }

    logger.info('Number of locations received: ' + links.length);
    for (let i = 0; i < links.length; i++) {
      await utils.delay(2000);
      logger.info('On scrape ' + i + ' / ' + links.length);

      try {
        logger.info('Scraping: ' + links[i].url);

        let res = await scrapePage(links[i]);

        if (res != null) {
          var flatResults = [].concat.apply([], res);

          // this is an async call
          await parse.process_results(flatResults, db);
        }
      } catch (error) {
        logger.error('Error in overall fetch: ' + error);
      }
    }
  }

  await browser.close();
  // close the dbclient
  await dbClient.close();
  logger.info('Deliveroo Scrape Done!');
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
