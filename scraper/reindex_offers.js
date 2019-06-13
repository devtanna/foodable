const puppeteer = require('puppeteer');
const $ = require('cheerio');

const settings = require('../settings');
const utils = require('./utils');
const parse = require('./parse_and_store/parse');
const dbutils = require('../scraper/db');

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
    reindex(db, dbClient);
  }
);
// ########## END DB STUFF ####################

async function reindex(db, dbClient) {
  var locationCollectionName = dbutils.getCurrentDBCollection();

  var find_threshold = dbutils.getCurrentHour() - 2;

  // find
  var restaurants = await db
    .collection(locationCollectionName)
    .find({ type: 'restaurant', added: { $gte: find_threshold } })
    .toArray();
  logger.debug('Found entities to index: ' + restaurants.length);
  var ops = [];
  if (restaurants.length > 0) {
    for (var i = 0, lenr = restaurants.length; i < lenr; i++) {
      // perform batch operations
      if (ops.length > 100) {
        logger.info(
          'Starting BATCH Number of operations => ' +
            ops.length +
            '. Progress: ' +
            i +
            ' / ' +
            restaurants.length
        );
        await db
          .collection(locationCollectionName)
          .bulkWrite(ops, { ordered: false })
          .then(
            function(result) {
              logger.info('Mongo BATCH Write Operation Complete');
            },
            function(err) {
              logger.error('Mongo BATCH Write: Promise: error ' + err);
            }
          )
          .catch(e => logger.error(e))
          .then(() => (ops = []));
      }
      // ==== END BATCH OPERATION

      current_restaturant = restaurants[i];
      current_restaturant_slug = restaurants[i]['slug'];
      current_source = restaurants[i]['source'];
      current_location_slug = restaurants[i]['locationSlug'];

      // find others that do not match the same scraper
      var otherRestaurants = await db
        .collection(locationCollectionName)
        .find({
          type: 'restaurant',
          locationSlug: current_location_slug,
          source: { $ne: current_source },
        })
        .toArray();

      if (otherRestaurants.length > 0) {
        var matchFound = false;
        for (var j = 0, lenor = otherRestaurants.length; j < lenor; j++) {
          if (otherRestaurants[j] == undefined) {
            continue;
          }
          other_restaturant = otherRestaurants[j];
          other_restaturant_slug = other_restaturant['slug'];

          cmp_score = parse.compare_strings(
            current_restaturant_slug,
            other_restaturant_slug
          );

          if (cmp_score > 0.8) {
            logger.debug(
              'found! ' +
                cmp_score +
                ' ' +
                other_restaturant_slug +
                ' ' +
                current_restaturant_slug
            );
            matchFound = true;
            delete current_restaturant['_id'];
            delete other_restaturant['_id'];

            ops.push({
              updateOne: {
                filter: {
                  type: 'offers',
                  added: dbutils.getCurrentHour(),
                  slug: current_restaturant_slug,
                  locationSlug: current_restaturant['locationSlug'],
                  locationId: current_restaturant['locationId'],
                  locationName: current_restaturant['locationName'],
                },
                update: {
                  $addToSet: {
                    offers: current_restaturant,
                  },
                },
                upsert: true,
                new: true,
              },
            });
            ops.push({
              updateOne: {
                filter: {
                  type: 'offers',
                  added: dbutils.getCurrentHour(),
                  slug: current_restaturant_slug,
                  locationSlug: current_restaturant['locationSlug'],
                  locationId: current_restaturant['locationId'],
                  locationName: current_restaturant['locationName'],
                },
                update: {
                  $addToSet: {
                    offers: other_restaturant,
                  },
                },
                upsert: true,
                new: true,
              },
            });
            // no need to look for more restaurants as we already got a match
            break;
          }
        }
        if (!matchFound) {
          logger.error('NOT FOUND :: ' + current_restaturant_slug);
          // no comparisons
          delete current_restaturant['_id'];
          ops.push({
            updateOne: {
              filter: {
                type: 'offers',
                added: dbutils.getCurrentHour(),
                slug: current_restaturant_slug,
                locationSlug: current_restaturant['locationSlug'],
                locationId: current_restaturant['locationId'],
                locationName: current_restaturant['locationName'],
              },
              update: {
                $addToSet: {
                  offers: current_restaturant,
                },
              },
              upsert: true,
              new: true,
            },
          });
        }
      } else {
        logger.error('NOT FOUND >> ' + current_restaturant_slug);
        // no other restaurant. lets add it to its own offer
        delete current_restaturant['_id'];
        ops.push({
          updateOne: {
            filter: {
              type: 'offers',
              added: dbutils.getCurrentHour(),
              slug: current_restaturant_slug,
              locationSlug: current_restaturant['locationSlug'],
              locationId: current_restaturant['locationId'],
              locationName: current_restaturant['locationName'],
            },
            update: {
              $addToSet: {
                offers: current_restaturant,
              },
            },
            upsert: true,
            new: true,
          },
        });
      }
    }
  }

  // insert to db
  if (ops.length > 0) {
    logger.info(' DB: Number of operations ' + ops.length);
    await db
      .collection(locationCollectionName)
      .bulkWrite(ops, { ordered: false })
      .then(
        function(result) {
          logger.info('Mongo Bulk Write Operation Complete');
        },
        function(err) {
          logger.error('Mongo Bulk Write: Promise: error ' + err);
        }
      )
      .catch(e => logger.error(e))
      .then(() => dbClient.close());
  } else {
    dbClient.close();
  }
}
