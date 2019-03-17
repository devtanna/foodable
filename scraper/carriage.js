const puppeteer = require('puppeteer');
const axios = require('axios');
const $ = require('cheerio');
const ObjectsToCsv = require('objects-to-csv');
const locations = require('./carriage_locations.json');

async function scrapeInfiniteScrollItems(page, pageCount, scrollDelay = 1000, location) {
    console.log("SCRAPING LOCATION:", location.name.toUpperCase());

    let items = [];
    let pageNum = 0;
    try {
      let previousHeight;

      await page.evaluate('$("#specialoffers").click()');
      await page.waitFor(4000);

      while (pageNum < pageCount) {
        console.log("Scraping page: " + pageNum);

        const html = await page.content();

        const listingsWithOffers = $('.restaurant-item', html); 

        try {
            listingsWithOffers.each(function() {
                let result = {
                    title: $('.rest-name-slogan h3', this).text().trim(),
                    href: "https://www.trycarriage.com/en/ae/" + $('a:first-child', this).prop('href'),
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

                items.push(result);
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
        console.log(e);
    }

    return items;
}

(async () => {
    // Set up browser and page.
    const browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    page.setViewport({ width: 1280, height: 926 });

    let giantResultsObj = [];

    for (let i = 0; i < locations.length; i++) {
        try {
            // Navigate to the page.
            await page.goto(`https://www.trycarriage.com/en/ae/restaurants?area_id=${locations[i].id}`, {waitUntil: 'load'});
            
            // max number of pages to scroll through
            let maxPage = 10;
            // Scroll and extract items from the page.
            let res = await scrapeInfiniteScrollItems(page, maxPage, 1000, locations[i]);

            giantResultsObj.push(res);
        } catch(error) {
            console.log(error);
        }
    };
  
    // Close the browser.
    await browser.close();

    console.log(giantResultsObj);

    let csv = new ObjectsToCsv(giantResultsObj);
    await csv.toDisk('./carriage.csv');
})();
