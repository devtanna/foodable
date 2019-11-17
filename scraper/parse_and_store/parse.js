const utils = require('../utils');
const dbutils = require('../db');
// logging init
const logger = require('../../helpers/logging').getLogger();

async function process_results(mergedResults, db, city) {
  let baselineLocations = await utils.getBaselineLocations(city);
  let collectionName = dbutils.getCurrentDBCollection();

  mergedResults.forEach(offer => {
    // get the location information
    let offerLocationObj = offer.location;
    if (!(offerLocationObj instanceof Array)) {
      offerLocationObj = [offerLocationObj];
    }

    offerLocationObj.forEach(offerLocation => {
      let baseLocation = baselineLocations[offerLocation];
      if (baseLocation) {
        offer.locationSlug = baseLocation.locationSlug;
        offer.locationName = baseLocation.locationName;
        offer.city = baseLocation.city;
        offer.sortSpread = utils.getRandomInt();
        delete offer._id; // delete so insert works
        delete offer.location; // no need for this

        try {
          db.collection(collectionName).insertOne(offer);
        } catch (e) {
          logger.error(`Error during insertOne. Error: ${e}`);
        }
      } else {
        logger.error(`Could not find ${offerLocation} in baseline.`);
      }
    });
  });
  logger.debug(`Parse ${mergedResults.length} Write Operation Complete.`);
}

module.exports = {
  process_results,
};
