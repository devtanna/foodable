const utils = require('../utils');
const settings = require('../../settings');
const dbutils = require('../db');
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
  var location_cmp_score_threshold = 0.95;
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
      var found_match = false;
      // add the restaurant to the location
      item_location = clean_location(mergedResults[i]['location'], scraperName);
      for (var j = 0, lenll = locations.length; j < lenll; j++) {
        stored_location = locations[j]['locationSlug'];
        cmp_score = compare_strings(stored_location, item_location);
        if (cmp_score > location_cmp_score_threshold) {
          mergedResults[i]['locationId'] = locations[j]['_id'];
          mergedResults[i]['locationSlug'] = locations[j]['locationSlug'];
          mergedResults[i]['locationName'] = locations[j]['locationName'];
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
          found_match = true;
          break;
        }
      }
      if (found_match == false) {
        logger.debug('!!! NO MATCH FOUND FOR: ' + item_location);
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
            logger.info('Mongo Batch Write Operation Complete');
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
  return clean_generic_location(location);
}

function clean_generic_location(location) {
  var item_location_slug = utils.slugify(location);

  var map_generic_location_to_talabat_location = {
    'jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'downtown-dubai': 'downtown-burj-khalifa',
    'festival-city': 'dubai-festival-city',
    'meena-bazaar': '',
    'dubai-investment-park': 'dubai-investments-park-1',
    'trade-centre-area': 'dubai-world-trade-center-dwtc',
    'european-business-centre-investment-park': 'dubai-investments-park-1',
    'european-business-centre-dubai-investment-park':
      'dubai-investments-park-1',
    'marina-walk-marina': 'dubai-marina',
    'jebel-ali-village': 'jebel-ali-1',
    'al-barsha-park-1': 'al-barsha-1',
    'al-khawaneej-east': 'al-khawaneej-1',
    'al-khawaneej-west': 'al-khawaneej-1',
    'al-quoz-pond-park': 'al-quoz-1',
    'al-warqaa': 'al-warqa-1',
    'american-university-of-dubai': 'dubai-media-city',
    'city-walk': 'al-satwa',
    'century-mall': '',
    dafza: '',
    'damac-hills': '',
    'deira-city-centre': 'corniche-deira',
    'dubai-international-city': '',
    'dubai-creek': 'corniche-deira',
    'dubai-mall': 'downtown-burj-khalifa',
    'emirates-tower': 'dubai-world-trade-center-dwtc',
    'emirates-golf-club': 'dubai-media-city',
    'festival-city': 'dubai-festival-city',
    'healthcare-city': 'dubai-healthcare-city',
    'internet-city-2': 'dubai-internet-city-dic',
    'ibn-battuta': 'ibn-batutta-mall',
    'ibn-battuta-mall-jebel-ali-village': 'ibn-batutta-mall',
    'jlt-west': 'jumeirah-lakes-towers-jlt',
    'jlt-connector': 'jumeirah-lakes-towers-jlt',
    jafilia: 'al-jaffiliya',
    'jebel-ali-village': 'ibn-batutta-mall',
    'madinat-al-jumeirah': 'jumeirah-3',
    'the-mall-umm-suqeim': 'jumeirah-3',
    'marina-mall': 'dubai-marina',
    'marina-west': 'dubai-marina',
    'nad-al-sheba': 'nad-al-sheba-1',
    'outlet-mall': '',
    'palm-residences': 'the-palm-jumeirah',
    'sheikh-zayed-road': 'dubai-world-trade-center-dwtc',
    'souk-al-bahar': 'downtown-burj-khalifa',
    'the-palm': 'the-palm-jumeirah',
    'umm-al-sheif': 'um-al-sheif',
    zabeel: 'zaabeel-1',
    'the-beach-jumeirah-beach-residence': 'jumeirah-beach-residence-jbr',
    'the-dubai-mall-downtown-dubai': 'downtown-burj-khalifa',
    'dubai-festival-city-mall-festival-city': 'dubai-festival-city',
    'cluster-h-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'al-seef-umm-hurair': 'umm-hurair-1',
    'hotel-ibis-world-trade-centre-trade-centre-area':
      'dubai-world-trade-center-dwtc',
    'dubai-world-trade-center-dwtc': 'dubai-world-trade-center-dwtc',
    'manzil-downtown-dubai': 'the-dubai-mall-downtown-dubai',
    'cluster-a-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-b-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-c-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-i-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-r-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-d-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-q-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-e-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-w-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-t-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-j-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-m-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-q-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-f-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-o-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-y-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-g-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-x-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-n-jumeirah-lake-towers': 'jumeirah-lakes-towers-jlt',
    'cluster-n-jumeirah-lake-towers-jlt': 'jumeirah-lakes-towers-jlt',
    'cluster-m-jumeirah-lake-towers-jlt': 'jumeirah-lakes-towers-jlt',
    'al-khail-mall-al-quoz': 'al-quoz',
    'ramee-rose-hotel-barsha-heights': 'barsha-heights-tecom',
    'mall-of-the-emirates-al-barsha': 'al-barsha',
    'al-khail-gate-al-qouz': 'al-quoz',
    'the-walk-jumeirah-beach-residence': 'jumeirah-beach-residence-jbr',
    'first-avenue-mall-motor-city': 'dubai-motor-city',
    'china-cluster-international-city': 'international-city',
    'england-cluster-international-city': 'international-city',
    'france-cluster-international-city': 'international-city',
    'morocco-cluster-international-city': 'international-city',
    'russia-cluster-international-city': 'international-city',
    'spain-cluster-international-city': 'international-city',
    'greece-cluster-international-city': 'international-city',
    'persia-cluster-international-city': 'international-city',
    'madina-mall-muhaisnah': 'al-muhaisnah',
    'al-muhaisnah': 'al-muhaisnah',
  };

  if (item_location_slug in map_generic_location_to_talabat_location) {
    return map_generic_location_to_talabat_location[item_location_slug];
  }

  return item_location_slug;
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
