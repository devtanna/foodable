const puppeteer = require('puppeteer');
const $ = require('cheerio');
const ObjectsToCsv = require('objects-to-csv');
const locations = require('./carriage_locations.json');

const settings = require('../settings');
const utils = require('./utils');
const parse = require('./parse_and_store/parse');
// ########## START DB STUFF ####################
var scraper_name = 'carriage';
var db;
var dbClient;
// Initialize connection once at the top of the scraper
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(settings.DB_CONNECT_URL, { useNewUrlParser: true }, function(err, client) {
  if(err) throw err;
  db = client.db(settings.DB_NAME);
  dbClient = client;
  console.log("... Carriage: Connected to mongo! ...");
});
// ########## END DB STUFF ####################




async function scrapeInfiniteScrollItems(page, pageCount, scrollDelay = 1000, location) {
    console.log("Carriage: Scraping location:", location.name.toUpperCase());

    let items = [];
    let pageNum = 0;
    try {
      let previousHeight;

      await page.evaluate('$("#specialoffers").click()');
      await page.waitFor(4000);

      while (pageNum < pageCount) {
        console.log("Carriage: Scraping page number: " + pageNum);

        const html = await page.content();

        const listingsWithOffers = $('.restaurant-item', html); 

        console.log("Carriage: Got number of offers: " + listingsWithOffers.length);

        try {
            listingsWithOffers.each(function() {
                let result = {
                    title: $('.rest-name-slogan h3', this).text().trim(),
                    score: utils.calculateScore({
                        offer:$("div[ng-if='rest.offersnippet']", this).text().trim(),
                        rating:$('.rating-num', this).text().trim()
                    }),
                    'type': 'restaurant',
                    source: `${scraper_name}`,
                    href: "https://www.trycarriage.com/en/ae/" + $('a:first-child', this).prop('href'),
                    slug: utils.slugify($('.rest-name-slogan h3', this).text().trim()),
                    image: $('.rest-cover', this).css('background-image'),
                    location: location.name, 
                    rating: null, 
                    cuisine: $('.rest-name-slogan p', this).text().trim(),
                    offer: "Special Offer",
                    deliveryTime: $('.del-time em', this).text().trim(),
                    minimumOrder: null,
                    deliveryCharge: null,
                    cost_for_two: null,
                    votes: null,
                    address: location.name
                };

                if (result.offer.length > 0 ){
                    var index = items.indexOf(result); // dont want to push duplicates
                    if (index === -1){
                        items.push(result);
                    }
                }
            });
        } catch(error) {
            console.log(error);
        }
        
        // scroll to next page
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await page.waitFor(scrollDelay);

        if (items.length === listingsWithOffers.length) break;

        pageNum++;
      }
    } catch(e) { 
        console.log('Carriage:', e);
    }
    console.log('Carriage: number of items scraped: '+items.length)
    return items;
}

(async () => {
    // Set up browser and page.
    const browser = await puppeteer.launch({
        headless: settings.PUPPETEER_BROWSER_ISHEADLESS, 
        args: settings.PUPPETEER_BROWSER_ARGS
    });
    const page = await browser.newPage();
    page.setViewport(settings.PUPPETEER_VIEWPORT);

    let giantResultsObj = [];

    for (let i = 0; i < locations.length; i++) {
        try {

            if (locations[i].id != 924){
                continue
            }

            // Navigate to the page.
            await page.goto(`https://www.trycarriage.com/en/ae/restaurants?area_id=${locations[i].id}`, {waitUntil: 'load'});
            
            // max number of pages to scroll through
            let maxPage = 10;
            // Scroll and extract items from the page.
            let res = await scrapeInfiniteScrollItems(page, maxPage, 1000, locations[i]);

            giantResultsObj.push(res);
        } catch(error) {
            console.log('Carriage:', error);
        }
    };
  
    // Close the browser.
    await browser.close();

    // merge all pages results into one array
    var mergedResults = [].concat.apply([], giantResultsObj);
    console.log("Carriage: Scraped Carriage. Results count: "+mergedResults.length);

    parse.process_results(mergedResults, db, dbClient, scraper_name);
})();
