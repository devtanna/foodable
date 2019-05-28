const settings = require('../settings');

offerMealZones = ['z', 'b', 'l', 'd'];

offerMealZoneToTimeMapping = {
  // midnight
  0: 'z',
  1: 'z',
  2: 'z',
  3: 'z',
  4: 'z',
  5: 'z',
  6: 'z',
  // breakfast time
  7: 'b',
  8: 'b',
  9: 'b',
  10: 'b',
  // lunch time
  11: 'l',
  12: 'l',
  13: 'l',
  14: 'l',
  15: 'l',
  16: 'l',
  // dinner time
  17: 'd',
  18: 'd',
  19: 'd',
  20: 'd',
  21: 'd',
  22: 'd',
  23: 'd',
};

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

function getCurrentMealTimeZone() {
  currentHours = getCurrentDateTime().getHours();
  return offerMealZoneToTimeMapping[currentHours];
}

function getMealTimeZoneForDateTime(datetime) {
  hours = datetime.getHours();
  return offerMealZoneToTimeMapping[hours];
}

function getCurrentMealTimeDBCollection(offset='+4'){
    var currentdate = getCurrentDateTime(offset);
    var datetimeNow = currentdate.getDate() + "_"
        + (currentdate.getMonth()+1)  + "_" 
        + currentdate.getFullYear();
    var mealTimeZone = getMealTimeZoneForDateTime(currentdate);
    if (settings.ENABLE_MEAL_TIME_ZOME){
        return settings.MONGO_COLLECTION_NAME + datetimeNow + "_" + mealTimeZone;
    } else {
        return settings.MONGO_COLLECTION_NAME + datetimeNow;
    }
}

function getDBCollectionForMealTimeZone(mealTimeZone='z', offset='+4'){
    var currentdate = getCurrentDateTime(offset);
    var datetimeNow = currentdate.getDate() + "_"
        + (currentdate.getMonth()+1)  + "_" 
        + currentdate.getFullYear();
    if (settings.ENABLE_MEAL_TIME_ZOME){
        return settings.MONGO_COLLECTION_NAME + datetimeNow + "_" + mealTimeZone;
    } else {
        return settings.MONGO_COLLECTION_NAME + datetimeNow;
    }
}

function checkDBhasActiveCollection(collections){
    var activeCollection = getCurrentMealTimeDBCollection();
    var found = collections.some(el => el.name === activeCollection);
    if (found){
        return true;
    }
    return false;
}

function getDBCollectionForMealTimeZoneAndDateTime(datetime, mealTimeZone='z', offset='+4'){
    var datetimeNow = datetime.getDate() + "_"
        + (datetime.getMonth()+1)  + "_" 
        + datetime.getFullYear();
    if (settings.ENABLE_MEAL_TIME_ZOME){
        return settings.MONGO_COLLECTION_NAME + datetimeNow + "_" + mealTimeZone;
    } else {
        return settings.MONGO_COLLECTION_NAME + datetimeNow;
    }
}

module.exports = {
    checkDBhasActiveCollection: checkDBhasActiveCollection,
    getCurrentDateTime: getCurrentDateTime,
    getCurrentMealTimeZone: getCurrentMealTimeZone,
    getMealTimeZoneForDateTime: getMealTimeZoneForDateTime,
    getCurrentMealTimeDBCollection: getCurrentMealTimeDBCollection,
    getDBCollectionForMealTimeZone: getDBCollectionForMealTimeZone,
    getDBCollectionForMealTimeZoneAndDateTime: getDBCollectionForMealTimeZoneAndDateTime
}

