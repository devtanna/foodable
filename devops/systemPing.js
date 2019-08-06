const axios = require('axios');

const settings = require('../settings')();
const dbutils = require('../scraper/db');

var db;
var dbClient;
// Initialize connection once at the top of the scraper
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(settings.DB_CONNECT_URL, { useNewUrlParser: true }, function(err, client) {
  if (err) throw err;
  db = client.db(settings.DB_NAME);
  dbClient = client;
  console.log('... Location script:Connected to mongo! ... at: ' + settings.DB_CONNECT_URL);

  sendStats(db);

  dbClient.close();
});
// ########## END DB STUFF ####################

function sendStats(db) {
  const collectionName = dbutils.getCurrentDBCollection();
  let totalCount = db
    .collection(collectionName)
    .find({ type: 'offers' })
    .count();
  let zCount = db
    .collection(collectionName)
    .find({ type: 'offers', 'offers.0.source': 'zomato' })
    .count();
  let tCount = db
    .collection(collectionName)
    .find({ type: 'offers', 'offers.0.source': 'talabat' })
    .count();
  let uCount = db
    .collection(collectionName)
    .find({ type: 'offers', 'offers.0.source': 'ubereats' })
    .count();
  let cCount = db
    .collection(collectionName)
    .find({ type: 'offers', 'offers.0.source': 'carriage' })
    .count();
  let dCount = db
    .collection(collectionName)
    .find({ type: 'offers', 'offers.0.source': 'deliveroo' })
    .count();

  console.log(totalCount);

  Promise.all([zCount, tCount, uCount, cCount, dCount, totalCount]).then(result => {
    const slackWebHook = 'https://hooks.slack.com/services/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';
    let payload = {
      text: `Current Offer Stats:\n\tZomato: ${result[0]}\n\tTalabat: ${result[1]}\n\tUbereats: ${
        result[2]
      }\n\tCarriage: ${result[3]}\n\tDeliveroo: ${result[4]}\n\n\tTotal: ${result[5]}.
      `,
      username: 'azure-scraper',
      icon_emoji: ':thumbsup:',
    };

    axios.post(slackWebHook, payload).then(res => {
      console.log(`statusCode: ${res.statusCode}`);
      console.log(res);
    });
  });
}
