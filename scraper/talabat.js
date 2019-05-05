const puppeteer = require('puppeteer');
const $ = require('cheerio');

const settings = require('../settings');
const utils = require('./utils');
const parse = require('./parse_and_store/parse');
// ########## START DB STUFF ####################
var scraper_name = 'talabat';
var db;
var dbClient;
// Initialize connection once at the top of the scraper
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(settings.DB_CONNECT_URL, { useNewUrlParser: true }, function(err, client) {
  if(err) throw err;
  db = client.db(settings.DB_NAME);
  dbClient = client;
  console.log("... Talabat:Connected to mongo! ...");
});
// ########## END DB STUFF ####################

const getLocations = async (page) => {
    try {
        await page.goto('https://www.talabat.com/uae/sitemap');
        const html = await page.content();
        const links = $("h4:contains('Dubai')", html).next('.row').find('a').map((i, link) => { 
            return { 
                locationName: $(link).text(), 
                url: $(link).prop('href') 
            };
        });
        return links;
    } catch(error) {
        console.log(error);
    }
}

async function scrapeInfiniteScrollItems(page, pageCount, scrollDelay = 1000) {
    let items = [];
    let pageNum = 0;
    try {
      let previousHeight;
      while (pageNum < pageCount) {
          
        const html = await page.content();
        // we get the location from the url
        const location = page.url().split('/')[6];
        await page.evaluate( () => {
            Array.from( document.querySelectorAll( 'span' ) ).filter( element => element.textContent === 'Offers' )[0].click();
        });

        $('.rest-link', html).each(function() {

            let cuisine = [];
            $('.cuisShow .ng-binding', this).each(function() {
                cuisine.push($(this).text());
            });
            
            let result = {
                    title: clean_talabat_title($('.media-heading', this).text().trim().replace(/['"]+/g, '')),
                    branch: clean_talabat_branch($('.media-heading', this).text().trim().replace(/['"]+/g, '')),
                    slug: utils.slugify(clean_talabat_title($('.media-heading', this).text().trim().replace(/['"]+/g, ''))),
                    href: 'https://www.talabat.com' + $(this).attr("href"),
                    image: $('.valign-helper', this).next().prop('lazy-img'),
                    location: location.trim(), 
                    rating: $('.rating-num', this).text().trim(), 
                    cuisine: cuisine.join(''),
                    offer: $("div[ng-if='rest.offersnippet']", this).text().trim(),
                    deliveryTime: $('span[ng-if="!showDeliveryRange || rest.dtim >= 120"]', this).text().trim(),
                    minimumOrder: $('span:contains("Min:")', this).next().text().trim(),
                    deliveryCharge: $('span[ng-switch-when="0"]', this).text().trim(),
                    cost_for_two: '', // no info on talabat
                    votes: '', // no info on talabat
                    source: `${scraper_name}`,
                    address: '', // no info on talabat
                    score: utils.calculateScore({
                        offer:$("div[ng-if='rest.offersnippet']", this).text().trim(),
                        rating:$('.rating-num', this).text().trim()
                    }),
                    'type': 'restaurant'
            };

            // if no offer, then skip
            if (result.offer.length > 0 ){
                var index = items.indexOf(result); // dont want to push duplicates
                if (index === -1){
                    items.push(
                        result
                    );
                }
            }
        });
        pageNum++;
        // scroll to next page
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await page.waitFor(scrollDelay);
      }
    } catch(e) { 
        console.log(e);
    }
    console.log('talabat: number of items scraped: '+items.length)
    return items;
}

(async () => {
    browser = await puppeteer.launch({ 
        headless: settings.PUPPETEER_BROWSER_ISHEADLESS, 
        args: settings.PUPPETEER_BROWSER_ARGS 
    });

    const page = await browser.newPage();
    await page.setViewport(settings.PUPPETEER_VIEWPORT);

    const urls = await getLocations(page);
    console.log('Talabat: Number of locations: '+urls.length);
    let giantResultsObj = []
    for (let i = 0; i < urls.length; i++) {
        let url = urls[i];

        // TESTING
        if (url['locationName'].toLowerCase()!='al karama'){
            continue;
        }

        try {
            // Navigate to the page.
            console.log('Talabat: Scraping location: '+url.url);
            await page.goto(`https://www.talabat.com/${url.url}`, settings.PUPPETEER_GOTO_PAGE_ARGS);
            
            // max number of pages to scroll through
            let maxPage = 5;
            // Scroll and extract items from the page.
            let res = await scrapeInfiniteScrollItems(page, maxPage);
            giantResultsObj.push(res);
        } catch(error) {
            console.log(error);
        }
    }
  
    // Close the browser.
    await browser.close();

    // merge all pages results into one array
    var mergedResults = [].concat.apply([], giantResultsObj);
    console.log("Talabat: Scraped talabat. Results count: "+mergedResults.length);

    parse.process_results(mergedResults, db, dbClient, scraper_name);

})();

function clean_talabat_title(title){
    return title.split(',')[0].replace('Restaurant', '').trim();
}

function clean_talabat_branch(title){
    var branch = title.split(',')[1];
    if (branch != undefined && branch.length > 0){
        return branch.trim();
    }
    return '';
}