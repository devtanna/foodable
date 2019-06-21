const puppeteer = require('puppeteer');
const $ = require('cheerio');

const settings = require('../settings');
const utils = require('./utils');
const parse = require('./parse_and_store/parse');
const dbutils = require('../scraper/db');
var ObjectID = require('mongodb').ObjectID;

// logging init
const logger = require('../helpers/logging').getLogger();
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
    logger.info('... Connected to mongo! ...');

    var currentDate = new Date();
    var todayDateStr =
      currentDate.getDate() +
      '_' +
      (currentDate.getMonth() + 1) +
      '_' +
      currentDate.getFullYear();

    // var yestDate =  new Date(new Date().setDate(currentDate - 1));
    var yestDate = new Date(
      new Date().setDate(dbutils.getCurrentDateTime().getDate() - 1)
    );
    var yestDateStr =
      yestDate.getDate() +
      '_' +
      (yestDate.getMonth() + 1) +
      '_' +
      yestDate.getFullYear();

    // Lets start reindexing!!
    reindex(db, dbClient, todayDateStr).then(() =>
      cleanUpOldOffers(db, dbClient, yestDateStr)
    );
  }
);
// ########## END DB STUFF ####################

async function cleanUpOldRestaurants(db, dbClient) {
  logger.info('Starting clean up process for Restaurants');
  var collectionName = dbutils.getCurrentDBCollection();
  var bulk = db.collection(collectionName).initializeUnorderedBulkOp();
  bulk.find({ type: 'restaurants', indexed: 1 }).remove();
  bulk.execute();
  logger.info('Cleanup done for restaurants');
}

async function cleanUpOldOffers(db, dbClient, date) {
  logger.info('Starting clean up process');
  var collectionName = dbutils.getCurrentDBCollection();
  var bulk = db.collection(collectionName).initializeUnorderedBulkOp();
  bulk.find({ type: 'offers', added: date }).remove();
  bulk.execute().then(() => dbClient.close());
  logger.info('Cleanup done for offers with date: ' + date);
}

async function reindex(db, dbClient, todayDateStr) {
  var collectionName = dbutils.getCurrentDBCollection();
  var ops = [];
  var BATCH_SIZE = 100;

  // find all new restaurants
  var restaurants = await db
    .collection(collectionName)
    .find({
      type: 'restaurant',
      indexed: {
        $eq: 0,
      },
    })
    .toArray();
  logger.debug('Found entities to index: ' + restaurants.length);
  if (restaurants.length > 0) {
    // lets clean up old restaurants first
    await cleanUpOldRestaurants(db, dbClient);
    // ok, cleaned up. lets continue

    for (var i = 0; i < restaurants.length; i++) {
      // ==== START BATCH OPERATION
      // perform batch operations
      if (ops.length > BATCH_SIZE) {
        logger.info(
          'Starting BATCH Number of operations => ' +
            ops.length +
            '. Progress: ' +
            i +
            ' / ' +
            restaurants.length
        );
        await db
          .collection(collectionName)
          .bulkWrite(ops, { ordered: false })
          .then(
            function(result) {
              logger.info(
                'Mongo BATCH Write Operation Complete: ' +
                  ops.length +
                  ' operations.'
              );
            },
            function(err) {
              logger.error('Mongo BATCH Write: Promise: error ' + err);
            }
          )
          .catch(e => logger.error(e))
          .then(() => (ops = []));
      }
      // ==== END BATCH OPERATION

      // step 1) setup current restaurant
      var current_res = restaurants[i],
        current_res_slug = restaurants[i]['slug'],
        current_res_id = current_res['_id'],
        current_source = restaurants[i]['source'],
        current_location_slug = restaurants[i]['locationSlug'],
        cuisineTags = current_res['cuisine'].split(',').map(s => s.trim());
      delete current_res['_id'];

      if (cuisineTags.length) {
        ops.push({
          updateOne: {
            filter: {
              type: 'cuisine',
            },
            update: {
              $addToSet: {
                tags: { $each: cuisineTags },
              },
            },
            upsert: true,
            new: true,
          },
        });
      }
      // step 2) find all offers in the same location
      var allOffers = await db
        .collection(collectionName)
        .find({
          type: 'offers',
          locationSlug: current_location_slug,
        })
        .toArray();
      logger.debug('Found offers in restaurant location: ' + allOffers.length);
      var foundMatch = false;
      if (allOffers.length > 0) {
        // setup best init
        for (var j = 0; j < allOffers.length; j++) {
          if (allOffers[j] == undefined) {
            continue;
          }

          var current_offer = allOffers[j],
            current_offer_slug = allOffers[j]['slug'],
            max_cmp = 0,
            best_offer = null;

          var cmp_score = parse.compare_strings(
            current_res_slug,
            current_offer_slug
          );
          if (cmp_score > max_cmp) {
            max_cmp = cmp_score;
            best_offer = allOffers[j];
          }
        }

        // now i have the best match
        if (max_cmp > 0.9 && (best_offer != null || best_offer != undefined)) {
          foundMatch = true;
          // add it to the offers set
          logger.debug('Match found for: ' + best_offer['slug']);
          ops.push({
            updateOne: {
              filter: {
                type: 'offers',
                added: todayDateStr,
                slug: best_offer['slug'],
                locationSlug: best_offer['locationSlug'],
                locationId: best_offer['locationId'],
                locationName: best_offer['locationName'],
              },
              update: {
                $addToSet: {
                  offers: current_res,
                },
              },
              upsert: true,
              new: true,
            },
          });
        } else {
          // no match found. have to add it to its own
          logger.debug('No match found for: ' + current_res['slug']);
          ops.push({
            updateOne: {
              filter: {
                type: 'offers',
                added: todayDateStr,
                slug: current_res['slug'],
                locationSlug: current_res['locationSlug'],
                locationId: current_res['locationId'],
                locationName: current_res['locationName'],
              },
              update: {
                $addToSet: {
                  offers: current_res,
                },
              },
              upsert: true,
              new: true,
            },
          });
        }

        // lets mark the restaurant as indexed
        ops.push({
          updateOne: {
            filter: {
              _id: ObjectID(current_res_id),
              type: 'restaurant',
            },
            update: {
              $set: {
                indexed: 1,
              },
            },
          },
        });
      } else {
        logger.debug('No offer even for: ' + current_res['slug']);
        ops.push({
          updateOne: {
            filter: {
              type: 'offers',
              added: todayDateStr,
              slug: current_res['slug'],
              locationSlug: current_res['locationSlug'],
              locationId: current_res['locationId'],
              locationName: current_res['locationName'],
            },
            update: {
              $addToSet: {
                offers: current_res,
              },
            },
            upsert: true,
            new: true,
          },
        });
        ops.push({
          updateOne: {
            filter: {
              _id: ObjectID(current_res_id),
              type: 'restaurant',
            },
            update: {
              $set: {
                indexed: 1,
              },
            },
          },
        });
      }
    }
  }

  // perform left over db operations
  if (ops.length > 0) {
    logger.info('Leftover DB: Number of operations ' + ops.length);
    await db
      .collection(collectionName)
      .bulkWrite(ops, { ordered: false })
      .then(
        function(result) {
          logger.info('Mongo Bulk Write Operation Complete');
        },
        function(err) {
          logger.error('Mongo Bulk Write: Promise: error ' + err);
        }
      )
      .catch(e => logger.error(e));
    // .then(() => dbClient.close());
  } else {
    // dbClient.close();
  }
}
