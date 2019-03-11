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

        const listingsWithOffers = $('.base_ > div a', html);

        try {
            listingsWithOffers.each(function() {
                if ($(this).find('.truncatedText_.ue-bz.ue-cq.ue-cp.ue-cr').length < 1) return;

                let result = {
                    title: $('.ue-ba.ue-bb.ue-bc.ue-bd.ue-c0.ue-c1.ue-ah.ue-ec', this).text().split('-')[0],
                    href: 'https://www.ubereats.com' + $(this).attr("href"),
                    image: null,
                    location: $('.ue-ba.ue-bb.ue-bc.ue-bd.ue-c0.ue-c1.ue-ah.ue-ec', this).text().split('-')[1], 
                    rating: $('div.ue-ei.ue-aj.ue-ej.ue-bc.ue-ek > div > span > span', this).text(), 
                    cuisine: $('div.ue-bz.ue-cq.ue-cp.ue-cr', this).text().trim(),
                    offer: $(".truncatedText_.ue-bz.ue-cq.ue-cp.ue-cr", this).text().trim(),
                    deliveryTime: $('div.ue-ei.ue-aj.ue-ej.ue-bc.ue-ek > div.ue-a6ue-ab', this).text().trim(),
                    minimumOrder: null,
                    deliveryCharge: null,
                    cost_for_two: null,
                    votes: $('div.ue-ei.ue-aj.ue-ej.ue-bc.ue-ek > div > span:nth-child(2)', this).text(),
                    address: $('.ue-ba.ue-bb.ue-bc.ue-bd.ue-c0.ue-c1.ue-ah.ue-ec', this).text().split('-')[1]
                };

                console.log(result);

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

    let giantResultsObj = [];

    try {
        // Navigate to the page.
        await page.goto('https://www.ubereats.com/en-AE/dubai/', {waitUntil: 'load'});
        
        // max number of pages to scroll through
        let maxPage = 2;
        // Scroll and extract items from the page.
        let res = await scrapeInfiniteScrollItems(page, maxPage);
        giantResultsObj.push(res);
    } catch(error) {
        console.log(error);
    }
  
    // Close the browser.
    await browser.close();

    let csv = new ObjectsToCsv(giantResultsObj);
    await csv.toDisk('./ubereats.csv');
  })();
