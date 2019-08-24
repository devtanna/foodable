const puppeteer = require('puppeteer');
const $ = require('cheerio');
const settings = require('../settings')();
const fs = require('fs');
const path = require('path');

const outputFile = path.join(__dirname, 'deliveroo_locations.json');

const getLocations = async page => {
  try {
    let data = [];
    await page.goto('https://deliveroo.ae/sitemap', settings.PUPPETEER_GOTO_PAGE_ARGS);
    const html = await page.content();
    $("h3:contains('Dubai')", html)
      .next('.sitemap--zones')
      .find('> li')
      .find('> a')
      .each((i, link) => {
        data.push({
          locationName: $(link).text(),
          url: $(link).prop('href'),
        });
      });
    return data;
  } catch (error) {
    console.log(error);
  }
};

const run = async () => {
  let browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
  });

  let page = await browser.newPage();
  await page.setViewport(settings.PUPPETEER_VIEWPORT);

  let data = [];

  try {
    let data = await getLocations(page);

    fs.writeFile(outputFile, JSON.stringify(data, null, 2), err => (err ? console.log(err) : 'Done!'));
  } catch (e) {
    console.log(e);
  } finally {
    await browser.close();
  }
};

run();
