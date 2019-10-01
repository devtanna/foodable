const utils = require('./utils');
const settings = require('../settings')();
const dbutils = require('../scraper/db');
var ObjectID = require('mongodb').ObjectID;

// logging init
const logger = require('../helpers/logging').getLogger();
// ########## START DB STUFF ####################
var db;
var dbClient;
// Initialize connection once at the top of the scraper
var MongoClient = require('mongodb').MongoClient;
let options = {
  keepAlive: 1,
  connectTimeoutMS: 60000,
  socketTimeoutMS: 60000,
  useNewUrlParser: true,
};
MongoClient.connect(settings.DB_CONNECT_URL, options, function(err, client) {
  if (err) throw err;
  db = client.db(settings.DB_NAME);
  dbClient = client;
  logger.info('... Connected to mongo! ... at: ' + settings.DB_CONNECT_URL);

  var currentDate = new Date();
  var todayDateStr = currentDate.getDate() + '_' + (currentDate.getMonth() + 1) + '_' + currentDate.getFullYear();

  // Lets start reindexing!!
  reindex(db, dbClient, todayDateStr).then(() => {
    logger.info('All done!');
    dbClient.close();
  });
});
// ########## END DB STUFF ####################

async function cleanUpOldRestaurants(db, dbClient) {
  logger.info('Starting Restaurant clean up process');
  var collectionName = dbutils.getCurrentDBCollection();
  var bulk = db.collection(collectionName).initializeUnorderedBulkOp();
  bulk.find({ type: 'restaurants', indexed: 1 }).remove();
  bulk.execute();
  logger.info('Cleanup done for restaurants');
}

async function cleanUpOldOffers(db, dbClient, date) {
  logger.info('Starting offer clean up process');
  var collectionName = dbutils.getCurrentDBCollection();
  var bulk = db.collection(collectionName).initializeUnorderedBulkOp();
  bulk.find({ type: 'offers', added: date }).remove();
  bulk.execute().then(() => dbClient.close());
  logger.info('Cleanup done for offers with date: ' + date);
}

async function reindex(db, dbClient, todayDateStr) {
  var collectionName = dbutils.getCurrentDBCollection();
  var offerInserts = [];
  var cuisineArray = [];

  // find all new restaurants
  var restaurants = await db
    .collection(collectionName)
    .find({
      type: 'restaurant',
    })
    .toArray();
  logger.debug('Found restaurants to index: ' + restaurants.length);
  if (restaurants.length > 0) {
    let restaurantMap = {};
    restaurants.forEach(restaurant => {
      delete restaurant['_id']; // so mongo does not treat it as different

      let key = `${restaurant.slug}_${restaurant.locationSlug}`;
      let cuisineTags = restaurant['cuisine'] ? restaurant['cuisine'].split(',').map(s => s.trim()) : [];
      restaurant['cuisineArray'] = cuisineTags;

      // PART2 -> hash the restaurants
      if (key in restaurantMap) {
        if (!restaurantMap[key].some(e => e.source == restaurant.source)) {
          restaurantMap[key].push(restaurant);
        }
      } else {
        restaurantMap[key] = [restaurant];
      }

      // PART3 -> accumulate cuisine tags
      if (restaurant['cuisine'] != null) {
        let cuisineTags = restaurant['cuisine'].split(',').map(s => s.trim());
        if (cuisineTags.length) {
          cuisineArray.push(cuisineTags);
        }
      }
    });

    // Now for putting it in the DB
    logger.debug(`Offer Map Size: ${Object.keys(restaurantMap).length} keys.`);
    if (restaurantMap) {
      for (const [key, value] of Object.entries(restaurantMap)) {
        let [restSlug, locSlug] = key.split('_');
        let baselineLocations = await utils.getBaselineLocations();
        let location = baselineLocations[locSlug];
        value.forEach(offer => {
          offerInserts.push({
            type: 'offers',
            added: todayDateStr,
            slug: restSlug,
            locationSlug: locSlug,
            locationName: location.locationName,
            offers: value,
          });
        });
      }
    }
  }

  var flattened = [];
  for (var i = 0; i < cuisineArray.length; ++i) {
    var current = cuisineArray[i];
    for (var j = 0; j < current.length; ++j)
      if (current[j]) {
        flattened.push(current[j]);
      }
  }

  const cuisinesSet = new Set(flattened);
  let cuisines = Array.from(cuisinesSet);
  // capitalize each cuisine
  cuisines = cuisines.map(function(x) {
    return utils.capitalizeFirstLetter(x);
  });
  logger.info(`Saving cuisines -> ${cuisines.length}`);
  await bulkInsert(db, [{ type: 'cuisine', tags: cuisines }], collectionName);

  logger.info('Saving offers ->');
  await bulkInsert(db, offerInserts, collectionName);
}

async function bulkInsert(db, ops, collectionName) {
  if (ops) {
    logger.info(`Got ${ops.length} operations for Bulk Save.`);
    var bulk = db.collection(collectionName).initializeUnorderedBulkOp();
    let counter = 0;
    ops.forEach(insert => {
      bulk.insert(insert);
      counter += 1;
      if (counter % 900 == 0) {
        logger.debug(`On ${counter} / ${ops.length} Batch; ${ops.length - counter} Remain.`);
        bulk.execute();
        bulk = db.collection(collectionName).initializeUnorderedBulkOp();
      }
    });
    bulk.execute(); // leftovers
    logger.info('Ops DONE!');
  }
}
