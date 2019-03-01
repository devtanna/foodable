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
        const links = $("h3:contains('Dubai')", html).next('.sitemap--zones').find('> li').find('> a').map((i, link) => { 
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

const scrapePage = async (url) => {
    try {
        await page.goto(`https://deliveroo.ae${url.url}?offer=do_1`);
        const html = await page.content();
        let result = [];

        $('ol li[class*="RestaurantsList"]', html).each(function() {
            let img
            try {
                img = $("div", this).first().children('a').first().children('span').first().children('div').first().css('background-image');
            } catch(err) {
                img = null;
                return;
            }

            let cuisine = [];
            $('span[class*="TagList"]', this).each(function() {
                cuisine.push($(this).text().trim());
            });
            cuisine.shift();

            result.push({
                title: $('div[class*="RestaurantCard"] span p', this).eq(0).text().trim(),
                href: $('a', this).prop('href'),
                image: img,
                location: url.locationName, 
                address: null, 
                cuisine: cuisine,
                offer: $('div[class*="RestaurantCard"] span p', this).eq(3).text().trim(),
                rating: $('span[class*="RestaurantStarRating"]', this).eq(2).text().trim(), 
                votes: $('span[class*="RestaurantStarRating"]', this).eq(4).text().trim(),
                cost_for_two: null
            });
        });

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
        data.push(res);
    }

    await browser.close();
    
    let csv = new ObjectsToCsv(data);
    await csv.toDisk('./deliveroo.csv');
}

run();
