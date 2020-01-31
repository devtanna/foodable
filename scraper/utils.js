const fetch = require('node-fetch');

function getProxy() {
  const url = 'https://gimmeproxy.com/api/getProxy?protocol=socks5&supportsHttps=true';
  return fetch(url)
    .then(res => res.json())
    .then(json => {
      console.log('Got proxy: ', json.curl);
      return json.curl;
    });
}

function getRandomInt() {
  const max = 10000;
  const min = 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// logging init
const logger = require('../helpers/logging').getLogger();

function slugify(string) {
  const a = 'àáäâãåăæçèéëêǵḧìíïîḿńǹñòóöôœṕŕßśșțùúüûǘẃẍÿź·/_,:;';
  const b = 'aaaaaaaaceeeeghiiiimnnnoooooprssstuuuuuwxyz------';
  const p = new RegExp(a.split('').join('|'), 'g');

  return string
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
}

function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0) costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

function calculateScore(item) {
  var offer = item['offer'];

  if (!offer) return;

  var offerMapping = {
    5: [
      /^Special Talabat Deal$/im,
      /^special carriage offer$/im,
      /^20 Dhs Lunch$/im,
      /^(\d+) aed meals$/im,
      /^(\d+) aed meal$/im,
      /^(\d+)% off all orders$/im,
      /^(\d+)%% off on all orders$/im,
      /^(\d+)% off$/im,
      /^(\d+)% off entire menu$/im,
      /^(\d+) % off$/im,
      /^(\d+)% off on all orders$/im,
      /^AED(\d+)% off on all orders$/im,
      /^(\d+)% off on all orders from/im,
      /^(\d+)% discount on food and beverage$/im,
      /^(\d+)% off every menu item today$/im,
      /^(\d+)% off on all dine-in and home-delivery orders$/im,
      /^discount of (\d+)% on your total bill$/im,
      /^2 for 1$/im,
      /^(\d+)% off tutte consegne a domicilio$/im,
      /^(\d+)% off tutte consegne a domicilio da (\d+):(\d+) (pm|am) a (\d+):(\d+) (pm|am)$/im,
      /^bogo$/im,
      /^Flash Deals$/im,
      /^buy 1 get 1 free$/im,
      /^AED(\d+)% off on all orders above AED(\d+)% from (\d+):(\d+) (pm|am) to (\d+):(\d+) (pm|am)$/im,
      /^50% off la tua prima consegna a domicilio da noi$/im,
      /^Buy One Get One free on select items$/im,
      /^special offer: buy one get one free!$/im,
      /^(\d+)% off selected items$/im,
      /^(\d+)% off on all dine-in and home-delivery orders Offer on home-delivery only applicable when you order online on Zomato$/im,
      /^(\d+)% off on all dine-in and home-delivery orders Valid from (\d+):(\d+) (pm|am) to (\d+):(\d+) (pm|am) Offer on home-delivery only applicable when you order online on Zomato$/im,
      /^(\d+)% off on all dine-in and home-delivery orders Only applicable on orders above aed\s*(\d+(.\d+)*) Offer on home-delivery only applicable when you order online on Zomato or the restaurant app$/im,
      /^(\d+)% off on dine-in and your first home-delivery order from us Valid from (\d+):(\d+) (pm|am) to (\d+):(\d+) (pm|am) Offer on home-delivery only applicable when you order online on Zomato$/im,
    ],
    4: [/^aed (\d+(.\d+)*) off all orders$/im, /^aed(\d+(.\d+)*) off all orders$/im],
    3: [
      /^aed(\d+(.\d+)*) off on all orders above aed(\d+(.\d+)*)$/im,
      /^aed(\d+(.\d+)*) off on dine-in above above aed(\d+(.\d+)*)$/im,
      /^aed\s*(\d+(.\d+)*) off on all dine-in and home-delivery orders Only applicable on orders above aed\s*(\d+(.\d+)*) Offer on home-delivery only applicable when you order online on Zomato$/im,
      /^(\d+)% off on all dine-in and home-delivery orders Only applicable on orders above aed\s*(\d+(.\d+)*) Valid from (\d+):(\d+) (pm|am) to (\d+):(\d+) (pm|am) Offer on home-delivery only applicable when you order online on Zomato$/im,
      /^(\d+)% off orders above aed\s*(\d+(.\d+)*)$/im,
      /^(\d+)% off on all orders above\s*(\d+(.\d+)*)$/im,
      /^(\d+)% off on all orders above\s*(\d+(.\d+)*)/im,
      /^(\d+)% off on all orders above aed\s*(\d+(.\d+)*)$/im,
      /^(\d+)% off on all orders above aed\s*(\d+(.\d+)*) from/im,
      /^(\d+)% off on dine-in above aed\s*(\d+(.\d+)*) from/im,
      /^(\d+)% off on dine-in above aed\s*(\d+(.\d+)*)/im,
      /^(\d+)% on all dine-in and home-delivery orders Only applicable on orders above aed\s*(\d+(.\d+)*) Offer on home-delivery only applicable when you order online on Zomato$/im,
      /^(\d+)% off on all dine-in and home-delivery orders Only applicable on orders above aed\s*(\d+(.\d+)*) Offer on home-delivery only applicable when you order online on Zomato$/im,
      /^(\d+)% off on dine-in and your first home-delivery order from us Only applicable on orders above aed\s*(\d+(.\d+)*) Offer on home-delivery only applicable when you order online on Zomato$/im,
      /^spend aed (\d+(.\d+)*), get (\d+)% off$/im,
      /^aed (\d+(.\d+)*) off selected items$/im,
      /^deals on$/im,
      /^free item with all orders$/im,
    ],

    2: [
      /^free item with orders over aed (\d+(.\d+)*)$/im,
      /^free [\w\s]+ with orders over aed (\d+(.\d+)*)$/im,
      /^Cheap Eats$/im,
      /^Free Dessert$/im,
      /^free delivery$/im,
      /^aed(\d+) off on your first order Only applicable on orders above aed(\d+)$/im,
      /^(\d+)% off on your first order only applicable on orders above aed(\d+)$/im,
      /^(\d+)% off on dine-in and your first home-delivery order from us Offer on home-delivery only applicable when you order online on Zomato or the restaurant app$/im,
      /^(\d+)% off on dine-in and your first home-delivery order from us Offer on home-delivery only applicable when you order online on Zomato$/im,
      /^(\d+)% off on dine-in and your first home-delivery order from us Only applicable on orders above aed(\d+) Offer on home-delivery only applicable when you order online on Zomato or the restaurant app$/im,
      /^(\d+)% off on your first order Only applicable on orders above aed(\d+) from (\d+):(\d+) (pm|am) to (\d+):(\d+) (pm|am)$/im,
      /^(\d+)% off on dine-in and your first home-delivery order from us$/im,
      /^(\d+)% off on your first order from/im,
      /^(\d+)% off on your first order$/im,
    ],

    1: [
      /^(feel good)*\s*meal deals$/im,
      /^special offers on menu items$/im,
      /^special offer$/im,
      /^(\d+)% off on dine-in$/im,
    ],
  };
  let scoreLevel, scoreValue;
  let foundMatch = false;
  Object.entries(offerMapping).some(([mapScore, regexes]) => {
    regexes.some(regex => {
      let regexMatchObject = offer.match(regex);
      scoreLevel = regexMatchObject ? mapScore : 0;
      scoreValue = regexMatchObject && regexMatchObject[1] ? regexMatchObject[1] : 0;

      if (regexMatchObject) {
        foundMatch = true;
        return true;
      }
    });
    if (foundMatch) return true;
  });

  if (!foundMatch || scoreLevel <= 0) {
    logger.error(`${item['title']}: NO SCORE ASSIGNED FOR: ${offer}`);
  }

  scoreLevel = Number(scoreLevel);
  scoreValue = Number(scoreValue);

  return { scoreLevel, scoreValue };
}

function delay(ms) {
  console.log('+', ms);
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

function compare_strings(base_string, scraped_string) {
  if (scraped_string.includes(base_string.replace('al', ''))) {
    return 1;
  }

  if (base_string.includes(scraped_string.replace('al', ''))) {
    return 1;
  }

  return similarity(base_string, scraped_string);
}

function getBaselineLocations(city) {
  let resultLocationObject = {};
  const baselineLocations = require(`./locations/${city}/baseline_locations`);
  if (baselineLocations.length) {
    baselineLocations.forEach(element => {
      resultLocationObject[element.slug] = {
        locationName: element.locationName,
        locationSlug: element.slug,
        type: 'location',
        city: city,
      };
    });
  }

  return resultLocationObject;
}

function getNumFromString(str) {
  if (str) {
    const matchedNum = str.match(/[+-]?\d+(\.\d+)?/g);
    let num = matchedNum ? matchedNum[0] : '0.00';
    if (+num < 10 && Number.isInteger(+num)) {
      num = parseInt(num).toFixed(2);
    }
    return num;
  } else return null;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = {
  slugify: slugify,
  calculateScore: calculateScore,
  getProxy: getProxy,
  delay: delay,
  getBaselineLocations: getBaselineLocations,
  compare_strings: compare_strings,
  getNumFromString: getNumFromString,
  capitalizeFirstLetter,
  getRandomInt,
};
