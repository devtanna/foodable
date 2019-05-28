const utils = require('../utils');
const settings = require('../../settings');
const dbutils = require('../db');

async function process_results(
  mergedResults,
  db,
  dbClient,
  scraperName,
  batch = false
) {
  // ============== DB Store section================================
  var locationCollectionName = dbutils.getCurrentDBCollection();

  // find
  var locations = await db
    .collection(locationCollectionName)
    .find({ type: 'location' })
    .toArray();

  var ops = [];
  if (mergedResults.length > 0) {
    for (var i = 0, lenmr = mergedResults.length; i < lenmr; i++) {
      if (mergedResults[i] == undefined) {
        continue;
      }
      // add the restaurant to the location
      item_location = clean_location(mergedResults[i]['location'], scraperName);
      for (var j = 0, lenll = locations.length; j < lenll; j++) {
        stored_location = locations[j]['locationSlug'];
        cmp_score = compare_strings(stored_location, item_location);
        if (cmp_score > 0.8) {
          mergedResults[i]['locationId'] = locations[j]['_id'];
          mergedResults[i]['locationSlug'] = locations[j]['locationSlug'];
          mergedResults[i]['added'] = dbutils.getCurrentHour();
          ops.push({
            updateOne: {
              filter: mergedResults[i],
              update: mergedResults[i],
              upsert: true,
              new: true,
            },
          });
          // no need to traverse more locations
          break;
        }
      }
    }
  }
  // insert to db as a giant blob
  if (!batch) {
    if (ops.length > 0) {
      db.collection(locationCollectionName)
        .bulkWrite(ops, { ordered: false })
        .then(
          function(result) {
            console.log('Mongo Bulk Write Operation Complete');
          },
          function(err) {
            console.log('Mongo Bulk Write: Promise: error', err);
          }
        )
        .catch(e => console.error(e))
        .then(() => dbClient.close());
    } else {
      dbClient.close();
    }
  } else {
    // batch insert
    if (ops.length > 0) {
      db.collection(locationCollectionName)
        .bulkWrite(ops, { ordered: false })
        .then(
          function(result) {
            console.log('Mongo Batch Write Operation Complete');
          },
          function(err) {
            console.log('Mongo Batch Write: Promise: error', err);
          }
        )
        .catch(e => console.error(e));
    }
  }
  // ============== END DB Store section================================
}

function clean_location(location, scraperName) {
  if (scraperName == 'zomato') {
    return clean_zomato_location(location);
  }
  return clean_generic_location(location);
}

function clean_generic_location(location) {
  return utils.slugify(location);
}

function clean_zomato_location(location) {
  location_zomato_map = {
    ', Dubai': '',
    'Dubai Mall': 'Dubai Mall Downtown Dubai',
    'Marina Mall': 'Dubai Marina',
    satwa: 'al-satwa',
    BurJuman: 'Karama', // TODO: fix
  };
  for (var key in location_zomato_map) {
    location = location.replace(key, location_zomato_map[key]);
  }
  location_array = location.split(',');
  cleaned_location = location_array[location_array.length - 1];
  return utils.slugify(cleaned_location);
}

function compare_strings(base_string, scraped_string) {
  if (scraped_string.includes(base_string.replace('al', ''))) {
    return 1;
  }

  if (base_string.includes(scraped_string.replace('al', ''))) {
    return 1;
  }

  return utils.stringDistance(base_string, scraped_string);
}

module.exports = {
  process_results: process_results,
  compare_strings: compare_strings,
};
