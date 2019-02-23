const puppeteer = require('puppeteer');
const axios = require('axios');
const $ = require('cheerio');
const ObjectsToCsv = require('objects-to-csv');

let browser;
let page;

const getLocations = async () => {
    try {
        await page.goto('https://deliveroo.ae/sitemap');
        const html = await page.content();
        const links = $("h3:contains('Dubai')", html).next('.sitemap--zones').find('li > a').map((i, link) => { 
            return { 
                locationName: $(link).text(), 
                url: $(link).prop('href') 
            };
        });
        console.log(links);
        return links;
    } catch(error) {
        console.log(error);
    }
}

const scrapePage = async (url) => {
    try {
        await page.goto(`https://deliveroo.ae${url.url}?offer=do_1`);
        const html = await page.content();
        let result = [];

        $('ol li[class*="RestaurantsList"]', html).each(function() {
            console.log(this);
            result.push({
                title: $('div[class*="RestaurantCard"] span p', this).eq(0).text().trim(),
                href: $('a', this).prop('href'),
                image: $('span[class*="RestaurantCard"] div', this).css('background-image'),
                location: url.locationName, 
                address: null, 
                cuisine: null,
                offer: $('div[class*="RestaurantCard"] span p', this).eq(3).text().trim(),
                rating: null,
                votes: null,
                cost_for_two: null
            });
        });

        console.log(result);
        return result;
    } catch(error) {
        console.log(error);
    }
};

let data = [];

const run = async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 800 });

    const links = await getLocations();

    for (let i = 0; i < links.length; i ++) {
        let res = await scrapePage(links[i]);
    }

    await browser.close();
    
    let csv = new ObjectsToCsv(data);
    await csv.toDisk('./deliveroo.csv');
}

run();
