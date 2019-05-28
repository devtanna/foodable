const puppeteer = require('puppeteer');
const $ = require('cheerio');

const settings = require('../settings');
const utils = require('./utils');
const dbutils = require('../scraper/db');
// ########## START DB STUFF ####################
var db;
var dbClient;
// Initialize connection once at the top of the scraper
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(
  settings.DB_CONNECT_URL,
  { useNewUrlParser: true },
  function(err, client) {
    if (err) throw err;
    db = client.db(settings.DB_NAME);
    dbClient = client;
    console.log('... Location script:Connected to mongo! ...');
  }
);
// ########## END DB STUFF ####################

const getLocations = async page => {
  try {
    await page.goto('https://www.talabat.com/uae/sitemap');
    const html = await page.content();
    const links = $("h4:contains('Dubai')", html)
      .next('.row')
      .find('a')
      .map((i, link) => {
        return {
          locationName: $(link).text(),
          locationSlug: utils.slugify($(link).text()),
          type: 'location',
        };
      });
    // return links;
    var ops = [];
    for (var j = 0; j < links.length; j++) {
      ops.push(links[j]);
    }
    return ops;
  } catch (error) {
    console.log(error);
  }
};

(async () => {
  browser = await puppeteer.launch({
    headless: settings.PUPPETEER_BROWSER_ISHEADLESS,
    args: settings.PUPPETEER_BROWSER_ARGS,
  });

  const page = await browser.newPage();
  await page.setViewport(settings.PUPPETEER_VIEWPORT);

  const urls = await getLocations(page);
  console.log('Location script: Number of locations: ' + urls.length);

  // Close the browser.
  await browser.close();
  try {
    if (urls.length > 0) {
      cleanupOldCollections(db);

      var collectionName = dbutils.getCurrentDBCollection();
      var locationCollection = db.collection(collectionName);

      var collectionFound = false;
      var dataFound = false;

      var collectionsList = await db.listCollections().toArray();
      collectionFound = dbutils.checkDBhasActiveCollection(collectionsList);

      if (collectionFound == true) {
        var collectionStats = await locationCollection.stats();
        dataFound = collectionStats['count'] > 0 ? true : false;
        console.log(
          'Location script: Size of collection:',
          collectionStats['count']
        );
      }

      if (!collectionFound || !dataFound) {
        console.log('Location script: Populating Collection.');
        locationCollection
          .insertMany(urls)
          .catch(e => console.error(e))
          .then(() => dbClient.close());
        console.log('Location script: Mongo Bulk Write Operation Complete');
      } else {
        dbClient.close();
      }
    }
  } catch (e) {
    console.log(e);
  }
})();

function cleanupOldCollections(db) {
  for (let i = 1; i < 31; i++) {
    var date = new Date(
      new Date().setDate(dbutils.getCurrentDateTime().getDate() - i)
    );
    collection_1 = dbutils.getDBCollectionForDateTime(date);

    db.collection(collection_1)
      .drop()
      .catch(e => {});

    console.log(
      'Location script: Location collections cleaned up.',
      collection_1
    );
  }
}
