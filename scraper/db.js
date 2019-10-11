const settings = require('../settings')();

function getCurrentHour() {
  return new Date().getHours();
}

function getCurrentDateTime(offset = '+4') {
  // create Date object for current location
  d = new Date();

  // convert to msec
  // add local time zone offset
  // get UTC time in msec
  utc = d.getTime() + d.getTimezoneOffset() * 60000;

  // create new Date object for different city
  // using supplied offset
  nd = new Date(utc + 3600000 * offset);

  return nd;
}

function getCurrentDBCollection(offset = '+4') {
  if (settings.USE_ONE_GLOBAL_COLLECTION) {
    return settings.MONGO_COLLECTION_NAME + '99_99_99';
  }
  var currentdate = getCurrentDateTime(offset);
  var datetimeNow = currentdate.getDate() + '_' + (currentdate.getMonth() + 1) + '_' + currentdate.getFullYear();

  return settings.MONGO_COLLECTION_NAME + datetimeNow;
}

function checkDBhasActiveCollection(collections) {
  var activeCollection = getCurrentDBCollection();
  var found = collections.some(el => el.name === activeCollection);
  if (found) {
    return true;
  }
  return false;
}

function getDBCollectionForDateTime(datetime, offset = '+4') {
  var datetimeNow = datetime.getDate() + '_' + (datetime.getMonth() + 1) + '_' + datetime.getFullYear();
  return settings.MONGO_COLLECTION_NAME + datetimeNow;
}

module.exports = {
  getCurrentHour: getCurrentHour,
  getCurrentDateTime: getCurrentDateTime,
  getDBCollectionForDateTime: getDBCollectionForDateTime,
  checkDBhasActiveCollection: checkDBhasActiveCollection,
  getCurrentDBCollection: getCurrentDBCollection,
};
