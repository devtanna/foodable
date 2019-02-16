const puppeteer = require('puppeteer');
const axios = require('axios');
const $ = require('cheerio');
const ObjectsToCsv = require('objects-to-csv');

let browser;
let page;

const scrapePage = async (pageNum = 1) => {
    try {
        const url = `https://www.zomato.com/dubai/restaurants?offers=1&page=${pageNum}`;
        await page.goto(url);
        const html = await page.content();
        let result = [];

        $('.search-result', html).each(function() {
            let cuisine = [];

            $('.search-page-text .nowrap a', this).each(function() {
                cuisine.push($(this).text());
            });

            result.push({
                title: $('.result-title', this).text().trim(),
                href: $('.result-title', this).prop('href'),
                image: $('.feat-img', this).css('background-image'),
                location: $('.search_result_subzone', this).text().trim(), 
                address: $('.search-result-address', this).text().trim(), 
                address: $('.search-result-address', this).text().trim(), 
                cuisine: cuisine.join(','),
                offer: $('.res-offers .zgreen', this).text().trim(),
                rating: $('.rating-popup', this).text().trim(),
                votes: $('[class^="rating-votes-div"]', this).text().trim(),
                cost_for_two: $('.res-cost span:nth-child(2)', this).text().trim()
            });
        });

        return { result, goNext: $('.paginator_item.next.item', html).length > 0 };
    } catch(error) {
        console.log(error);
    }
};

let hasNext = true;
let pageNum = 1;
let data = [];

const run = async () => {
    browser = await puppeteer.launch({ headless: false });
    page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 800 });

    while (hasNext) {
        let res = await scrapePage(pageNum);
        data.push(res.result);
        if (res.goNext) {
            pageNum++;
        } else {
            hasNext = false;
        }
    }

    await browser.close();

    console.log(data);

    let csv = new ObjectsToCsv(data);
    await csv.toDisk('./zomato.csv');
}

run();
