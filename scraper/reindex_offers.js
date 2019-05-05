const puppeteer = require('puppeteer');
const $ = require('cheerio');

const settings = require('../settings');
const utils = require('./utils');
const parse = require('./parse_and_store/parse');
// ########## START DB STUFF ####################
var db;
var dbClient;
// Initialize connection once at the top of the scraper
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(settings.DB_CONNECT_URL, { useNewUrlParser: true }, function(err, client) {
  if(err) throw err;
  db = client.db(settings.DB_NAME);
  dbClient = client;
  console.log("... reindex:Connected to mongo! ...");
  reindex(db,dbClient);
});
// ########## END DB STUFF ####################

async function reindex(db,dbClient){
    var currentdate = new Date(); 
    var datetime = currentdate.getDate() + "_"
                + (currentdate.getMonth()+1)  + "_" 
                + currentdate.getFullYear();
    var locationCollectionName = settings.MONGO_COLLECTION_NAME + datetime;

    // find
    var restaurants = await db.collection(locationCollectionName).find({'type': 'restaurant'}).toArray();
    var ops = [];
    if (restaurants.length > 0){
        for (var i = 0, lenr = restaurants.length; i < lenr; i++) {
            current_restaturant = restaurants[i]
            current_restaturant_slug = restaurants[i]['slug']
            current_source = restaurants[i]['source']
            current_location_slug = restaurants[i]['locationSlug']
            // find others that do not match
            var otherRestaurants = await db.collection(locationCollectionName).find(
                {
                    'type': 'restaurant',
                    'locationSlug': current_location_slug,
                    'source': {$ne: current_source},
                }
            ).toArray();
            if (otherRestaurants.length > 0){
                for (var j = 0, lenor = otherRestaurants.length; j < lenor; j++) {
                    if (otherRestaurants[j] == undefined){
                        continue
                    }
                    other_restaturant = otherRestaurants[j]
                    other_restaturant_slug = other_restaturant['slug']

                    cmp_score = parse.compare_strings(current_restaturant_slug, other_restaturant_slug)
                            
                    if (cmp_score > 0.8){
                        console.log("found!", cmp_score, other_restaturant_slug, current_restaturant_slug);

                        delete current_restaturant['_id'];
                        delete other_restaturant['_id'];
                        
                        ops.push(
                            {
                                updateOne: {
                                    'filter': {
                                        'type': 'offers',
                                        'slug': current_restaturant_slug,
                                        'locationSlug': current_restaturant['locationSlug'],
                                        'locationId': current_restaturant['locationId'],
                                    },
                                    'update': {
                                        $addToSet: {
                                            'offers': current_restaturant
                                        }
                                    },
                                    'upsert': true,
                                    'new':true
                                }
                            }
                        );
                        ops.push(
                            {
                                updateOne: {
                                    'filter': {
                                        'type': 'offers',
                                        'slug': current_restaturant_slug,
                                        'locationSlug': current_restaturant['locationSlug'],
                                        'locationId': current_restaturant['locationId'],
                                    },
                                    'update': {
                                        $addToSet: {
                                            'offers': other_restaturant
                                        }
                                    },
                                    'upsert': true,
                                    'new':true
                                }
                            }
                        );
                        // no need to look for more restaurants as we already got a match
                        break;
                    }
                } 
            }
        }
    }

    // insert to db
    if (ops.length > 0){
        db.collection(locationCollectionName).bulkWrite(ops, { ordered: false }).then(function (result)
            {
                console.log('Reindex offers: Mongo Bulk Write Operation Complete');
            }, function (err)
            {
                console.log('Reindex offers: Mongo Bulk Write: Promise: error', err);
        })
        .catch(e => console.error(e))
        .then(() => dbClient.close());
    } else {
        dbClient.close();
    }
}
