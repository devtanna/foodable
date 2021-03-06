const puppeteer = require('puppeteer');
const $ = require('cheerio');

const settings = require('../../settings')();
const utils = require('../utils');
const dbutils = require('../db');
// ########## START DB STUFF ####################
var db;
var dbClient;
// Initialize connection once at the top of the scraper
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(settings.DB_CONNECT_URL, { useNewUrlParser: true }, function(err, client) {
  if (err) throw err;
  db = client.db(settings.DB_NAME);
  dbClient = client;
  console.log('... Location script:Connected to mongo! ... at: ' + settings.DB_CONNECT_URL);
  cleanupOldCollections(db);
  dbClient.close();
});
// ########## END DB STUFF ####################

function cleanupOldCollections(db) {
  var collectionName = dbutils.getCurrentDBCollection();
  db.collection(collectionName)
    .drop()
    .catch(e => {});

  console.log('Location script: Location collections cleaned up.', collectionName);
  // db.collection(settings.SUBSCRIPTION_MONGO_COLLECTION_NAME)
  //   .drop()
  //   .catch(e => {});
  // console.log('Location script: Collections cleaned up.', 'subscription');
  // db.collection(settings.CONTACTUS_MONGO_COLLECTION_NAME)
  //   .drop()
  //   .catch(e => {});
  // console.log('Location script: Collections cleaned up.', 'contact us');
}
