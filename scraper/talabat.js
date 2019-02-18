const puppeteer = require('puppeteer');
const axios = require('axios');
const $ = require('cheerio');
const ObjectsToCsv = require('objects-to-csv');

async function scrapeInfiniteScrollItems(page, pageCount, scrollDelay = 1000) {
    let items = [];
    let pageNum = 0;
    try {
      let previousHeight;
      while (pageNum < pageCount) {
        console.log("Scraping page: " + pageNum);
        
        const html = await page.content();
        // we get the location from the url
        const location = page.url().split('/')[6]             
        $('.rest-link', html).each(function() {

            let cuisine = [];
            $('.cuisShow .ng-binding', this).each(function() {
                cuisine.push($(this).text());
            });
            
            let result = {
                    title: $('.media-heading', this).text().trim().replace(/['"]+/g, ''),
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
                    address: '' // no info on talabat
            };

            // if no offer, then skip
            if (result.offer.length <=0 ){
                return;
            }

            var index = items.indexOf(result);
            if (index === -1){
                items.push(result);
            }
        });
        
        // scroll to next page
        previousHeight = await page.evaluate('document.body.scrollHeight');
        await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
        await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
        await page.waitFor(scrollDelay);
        pageNum++;
      }
    } catch(e) { 
        console.log(e);
    }

    console.log(items);

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

    const urls = [
        'https://www.talabat.com/uae/restaurants/1256/difc',
        'https://www.talabat.com/uae/restaurants/1589/abu-shagara'
    ];
    let giantResultsObj = []
    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        // Navigate to the page.
        console.log('Handling URL: '+ url);
        await page.goto(`${url}`, {waitUntil: 'load'});
        
        // max number of pages to scroll through
        let maxPage = 1;
        // Scroll and extract items from the page.
        giantResultsObj.push(await scrapeInfiniteScrollItems(page, maxPage));
    }
  
    // Close the browser.
    await browser.close();

    let csv = new ObjectsToCsv(giantResultsObj);
    await csv.toDisk('./talabat.csv');
  })();
