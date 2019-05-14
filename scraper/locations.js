const puppeteer = require('puppeteer');
const $ = require('cheerio');

const settings = require('../settings');
const utils = require('./utils');
// ########## START DB STUFF ####################
// var scraper_name = 'Location script';
var db;
var dbClient;
// Initialize connection once at the top of the scraper
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(settings.DB_CONNECT_URL, { useNewUrlParser: true }, function(err, client) {
  if(err) throw err;
  db = client.db(settings.DB_NAME);
  dbClient = client;
  console.log("... Location script:Connected to mongo! ...");
});
// ########## END DB STUFF ####################

const getLocations = async (page) => {
    try {
        await page.goto('https://www.talabat.com/uae/sitemap');
        const html = await page.content();
        const links = $("h4:contains('Dubai')", html).next('.row').find('a').map((i, link) => { 
            return { 
                locationName: $(link).text(),
                locationSlug: utils.slugify($(link).text()),
                type: 'location'
            };
        });
        // return links;
        var ops = [];
        for (var j = 0; j < links.length; j++){
            ops.push(links[j]);
        }
        return ops
    } catch(error) {
        console.log(error);
    }
}

(async () => {
    browser = await puppeteer.launch({ 
        headless: settings.PUPPETEER_BROWSER_ISHEADLESS, 
        args: settings.PUPPETEER_BROWSER_ARGS 
    });

    const page = await browser.newPage();
    await page.setViewport(settings.PUPPETEER_VIEWPORT);

    const urls = await getLocations(page);
    console.log('Location script: Number of locations: '+urls.length);
  
    // Close the browser.
    await browser.close();
    try {
        if (urls.length > 0){
            cleanupOldCollections(db);

            var currentdate = new Date(); 
            var datetime = currentdate.getDate() + "_"
                + (currentdate.getMonth()+1)  + "_" 
                + currentdate.getFullYear();
            var collectionName = settings.MONGO_COLLECTION_NAME + datetime;
            var locationCollection = db.collection(collectionName);

            locationCollection.insertMany(
                urls
            )
            .catch(e => console.error(e))
            .then(() => dbClient.close());
            console.log('Location script: Mongo Bulk Write Operation Complete');
        }
    } catch(e) { 
        console.log(e);
    }
  })();

function cleanupOldCollections(db){
    for (let i = 0; i < 31; i++) {
        var date = new Date(new Date().setDate(new Date().getDate()-i));
        var datetime = date.getDate() + "_"
                + (date.getMonth()+1)  + "_" 
                + date.getFullYear();
        var collectionName = settings.MONGO_COLLECTION_NAME + datetime;
        var locationCollection = db.collection(collectionName);
        locationCollection.drop().catch(e => console.error(''));
        console.log('Location script: Location collections cleaned up.');
    }
}
