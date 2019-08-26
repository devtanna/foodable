const settings = require('../../settings')();
const dbutils = require('../db');

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

//////////////////////////
process.env.MONGO_ENV = 'localhost'; // change to 'atlas' to run this script on atlas
//////////////////////////

MongoClient.connect(settings.DB_CONNECT_URL, options, function(err, client) {
  if (err) throw err;
  db = client.db(settings.DB_NAME);
  dbClient = client;

  logger.info('... Connected to mongo! ... at: ' + settings.DB_CONNECT_URL);

  cleanUpTalabat(db).then(() => {
    logger.info('All done cleaning up talabat!');
    dbClient.close();
  });
});

async function cleanUpTalabat(db) {
  logger.info('Starting Talabat clean up process of restaurants and offers!');
  var collectionName = dbutils.getCurrentDBCollection();
  var bulk = db.collection(collectionName).initializeUnorderedBulkOp();
  bulk.find({ type: 'restaurants', source: 'talabat' }).remove();
  bulk.find({ type: 'offers', source: 'talabat' }).remove();
  bulk.execute();
  logger.info('Cleanup done for talabat restaurants and offerse');
}
