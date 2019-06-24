const utils = require('../utils');
const settings = require('../../settings')();
const dbutils = require('../db');
const fs = require('fs');
// logging init
const logger = require('../../helpers/logging').getLogger();

async function process_results(
  mergedResults,
  db,
  dbClient,
  scraperName,
  batch = false
) {
  // ============== DB Store section================================
  var locationCollectionName = dbutils.getCurrentDBCollection();
  var ops = [];
  if (mergedResults.length > 0) {
    var locations = JSON.parse(
      fs.readFileSync('./fixtures/locations.json', 'utf8')
    );
    logger.debug(
      'Loaded location fixtures: ' + locations.length + ' locations.'
    );

    for (var i = 0, lenmr = mergedResults.length; i < lenmr; i++) {
      if (mergedResults[i] == undefined) {
        continue;
      }
      var cmp_score = 0;
      var item_location = clean_location(
        mergedResults[i]['location'],
        scraperName
      ); // this is a location name; convert to slug for easier matching
      var best_match = {
        cmp_score: 0,
        _id: '',
        locationName: '',
        locationSlug: '',
        type: 'location',
      };
      for (var j = 0, lenll = locations.length; j < lenll; j++) {
        cmp_score = compare_strings(
          locations[j]['locationSlug'],
          item_location
        );

        // compare all first and find max
        if (cmp_score > best_match['cmp_score']) {
          best_match['cmp_score'] = cmp_score;
          best_match['_id'] = locations[j]['_id'];
          best_match['locationSlug'] = locations[j]['locationSlug'];
          best_match['locationName'] = locations[j]['locationName'];
        }
      }
      if (best_match['cmp_score'] == 0) {
        logger.error(
          '!!! NO MATCH FOUND FOR: ' + item_location + ' Please normalize.'
        );
      } else {
        mergedResults[i]['locationId'] = best_match['_id'];
        mergedResults[i]['locationSlug'] = best_match['locationSlug'];
        mergedResults[i]['locationName'] = best_match['locationName'];
        // mergedResults[i]['added'] = dbutils.getCurrentHour();
        mergedResults[i]['indexed'] = 0;
        ops.push({
          updateOne: {
            filter: mergedResults[i],
            update: mergedResults[i],
            upsert: true,
            new: true,
          },
        });
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
            logger.info('Mongo Bulk Write Operation Complete');
          },
          function(err) {
            logger.error('Mongo Bulk Write: Promise: error', err);
          }
        )
        .catch(e => logger.error(e))
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
            logger.info(
              'Mongo Batch Write Operation Complete: ' +
                ops.length +
                ' operations.'
            );
          },
          function(err) {
            logger.error('Mongo Batch Write: Promise: error', err);
          }
        )
        .catch(e => console.error(e));
    }
  }
  // ============== END DB Store section================================
}

function clean_location(location, scraperName) {
  return utils.slugify(location);
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
