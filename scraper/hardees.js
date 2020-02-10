const puppeteer = require('puppeteer');
const $ = require('cheerio');
const settings = require('../settings')();
const parse = require('./parse_and_store/parse');
const locations = require(`./locations/partners/hardees.json`);

// logging init
const logger = require('../helpers/logging').getLogger();
// ########## START DB STUFF ####################
var db;
var dbClient;
// Initialize connection once at the top of the scraper
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(settings.DB_CONNECT_URL, { useNewUrlParser: true }, function(err, client) {
  if (err) throw err;
  db = client.db(settings.DB_NAME);
  dbClient = client;
  logger.info('... Connected to mongo! ... at: ' + settings.DB_CONNECT_URL);
});
// ########## END DB STUFF ####################

const scrapePage = async (page, location) => {
  try {
    await page.goto(location.url, settings.PUPPETEER_GOTO_PAGE_ARGS);
    const html = await page.content();
    let result = [];

    $('div.bucket', html).each(function() {
      let price = $('.sp_amt', this)
        .text()
        .trim();
      let offer = $('.mtb-title', this)
        .text()
        .trim();

      if (price) {
        offer += ` - AED${price}`;
      }

      let singleItem = {
        title: 'Hardees',
        href: $('a.mtb-more.locationpopup.mtb-getstarted', this).prop('href'),
        image: '/static/partners/hardees.webp',
        address: '',
        cuisine: 'Burger, American, Fast food',
        offer,
        description: $('.mtb-desc', this)
          .text()
          .trim(),
        rating: '',
        votes: '',
        cost_for_two: '',
        source: 'hardees',
        slug: 'hardees-partner',
        deliveryTime: null,
        deliveryCharge: null,
        minimumOrder: null,
        type: 'restaurant',
      };

      // if no offer, then skip
      if (singleItem.offer.length > 0) {
        singleItem['scoreLevel'] = 5;
        singleItem['scoreValue'] = price * -1;

        var index = result.indexOf(singleItem); // dont want to push duplicates
        if (index === -1) {
          result.push(singleItem);
        }
      }
    });

    return result;
  } catch (error) {
    logger.error('Error in data extract: ' + error);
  }
};

const run = async () => {
  let browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: settings.PUPPETEER_BROWSER_ARGS,
  });

  if (locations != null) {
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
      } else if (val <= 0 && fdbGen.next().done) {
        handleClose();
      }
    });

    const handleClose = () => {
      browser.close();
      dbClient.close();
    };

    function* scrapeGenerator() {
      for (let i = 0; i < locations.length; i++) {
        if (openPages.v >= settings.MAX_TABS) {
          yielded = true;
          yield i;
        }
        openPages.v++;
        let location = locations[i];

        browser.newPage().then(async page => {
          await page.setViewport(settings.PUPPETEER_VIEWPORT);

          try {
            let res = await scrapePage(page, location);
            if (res != undefined) {
              var flatResults = [].concat.apply([], res);
              let baselines = location.baseline;
              Object.entries(baselines).forEach(async ([CITY, baseline]) => {
                flatResults = flatResults.map(r => {
                  return { ...r, location: baseline };
                });
                await parse.process_results(flatResults, db, CITY);
                await page.close();
                openPages.v--;
              });
            }
          } catch (e) {
            logger.error(`Error: ${e}`);
          }
        });
      }
    }

    fdbGen.next();
  }
};

run();
