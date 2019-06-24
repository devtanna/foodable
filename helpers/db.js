const settings = require('../settings')();
var MongoClient = require('mongodb').MongoClient;

function insertOneEntryIntoMongo(data, collectionName) {
  MongoClient.connect(settings.DB, { useNewUrlParser: true }, function(
    err,
    db
  ) {
    if (err) throw err;
    var dbo = db.db(settings.DB_NAME);

    dbo.collection(collectionName).insertOne(data, function(err, res) {
      if (err) throw err;
      console.log(collectionName, '1 document inserted', data);
      db.close();
    });
  });
}

module.exports = {
  insertOneEntryIntoMongo: insertOneEntryIntoMongo,
};
