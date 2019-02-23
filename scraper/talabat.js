const puppeteer = require('puppeteer');
const axios = require('axios');
const $ = require('cheerio');
const ObjectsToCsv = require('objects-to-csv');

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
        console.log("Scraping page: " + pageNum);
        
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

    const urls = await getLocations(page);

    let giantResultsObj = []
    for (let i = 0; i < urls.length; i++) {
        let url = urls[i];
        try {
            // Navigate to the page.
            await page.goto(`https://www.talabat.com/${url.url}`, {waitUntil: 'load'});
            
            // max number of pages to scroll through
            let maxPage = 1;
            // Scroll and extract items from the page.
            let res = await scrapeInfiniteScrollItems(page, maxPage);
            giantResultsObj.push(res);
        } catch(error) {
            console.log(error);
        }
    }
  
    // Close the browser.
    await browser.close();

    let csv = new ObjectsToCsv(giantResultsObj);
    await csv.toDisk('./talabat.csv');
  })();
