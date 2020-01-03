const puppeteer = require('puppeteer');
const $ = require('cheerio');
const settings = require('../settings')();
const resUrls = require('./zomato_res_urls.json');
const fs = require('fs');
const path = require('path');
const outputFile = path.join(__dirname, 'zomato_res_urls.json');

let browser;
let page;

const scrapePage = async resId => {
  try {
    const url = `https://www.zomato.com/restaurant?res_id=${resId}&tab=order`;
    await page.goto(url, settings.PUPPETEER_GOTO_PAGE_ARGS);
    return page.url();
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

  try {
    const objToFixArr = [];

    Object.keys(resUrls).forEach(key => {
      if (resUrls[key] === 'FIXME') {
        objToFixArr.push(key);
      }
    });

    for (let i = 0; i < objToFixArr.length; i++) {
      const resId = objToFixArr[i];
      let res = await scrapePage(resId);
      resUrls[resId] = res;
    }

    fs.writeFile(outputFile, JSON.stringify(resUrls, null, 2), err => (err ? console.log(err) : 'Done!'));
  } catch (e) {
    console.log(e);
  } finally {
    await browser.close();
  }
};

run();
