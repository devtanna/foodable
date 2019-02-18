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
                    // href: this.attr('href')
                    image: $('.valign-helper', this).next().prop('lazy-img'),
                    location: location.trim(), 
                    address: '', 
                    cuisine: cuisine.join('')
                //   offer: $('.res-offers .zgreen', this).text().trim(),
                //   rating: $('.rating-popup', this).text().trim(),
                //   votes: $('[class^="rating-votes-div"]', this).text().trim(),
                //   cost_for_two: $('.res-cost span:nth-child(2)', this).text().trim()
            };
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
    
    page.on('console', consoleMessageObject => function (consoleMessageObject) {
        if (consoleMessageObject._type !== 'warning') {
            console.debug(consoleMessageObject._text)
        }
    });

    // Navigate to the demo page.
    await page.goto('https://www.talabat.com/uae/restaurants/1256/difc');
    
    let maxPage = 3;
    
    // Scroll and extract items from the page.
    const items = await scrapeInfiniteScrollItems(page, maxPage);
  
    // Close the browser.
    await browser.close();

    let csv = new ObjectsToCsv(items);
    await csv.toDisk('./talabat.csv');
  })();
