const puppeteer = require('puppeteer');
const $ = require('cheerio');
const settings = require('../settings')();
const areas = require('./zomato_areas.json');
const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, 'zomato_locations.json');

let browser;
let page;

const scrapePage = async url => {
  try {
    await page.goto(url, settings.PUPPETEER_GOTO_PAGE_ARGS);
    const html = await page.content();
    let locationUrl = $('.cat-subzone-res .ta-right a', html)
      .eq(0)
      .attr('href');
    let urlObj = new URL(locationUrl ? locationUrl : url);
    urlObj.search = 'offers=1';
    return urlObj.href;
  } catch (e) {
    console.log(`error in ${url}`);
  }
};

const run = async () => {
  browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
  });

  page = await browser.newPage();
  await page.setViewport(settings.PUPPETEER_VIEWPORT);

  let data = [];

  try {
    for (let i = 0; i < areas.length; i++) {
      let res = await scrapePage(areas[i].url);
      console.log(res);
      data.push({ url: res, name: areas[i].name });
    }

    fs.writeFile(outputFile, JSON.stringify(data, null, 2), err =>
      err ? console.log(err) : 'Done!'
    );
  } catch (e) {
    console.log(e);
  } finally {
    await browser.close();
  }
};

run();
