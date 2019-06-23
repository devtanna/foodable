// Global app settings
var currentdate = new Date();
var datetime =
  currentdate.getDate() +
  '_' +
  (currentdate.getMonth() + 1) +
  '_' +
  currentdate.getFullYear();

const isServerRequest = process && process.env && process.env.HOSTNAME != null;
const backendEndpointForClient = 'http://foodable.local:8090/graphql';
const backendEndpointForServer = 'http://foodable_back:4000/graphql';
var DOCKER_BACKEND_ENDPOINT =
  isServerRequest != null && isServerRequest == true
    ? backendEndpointForServer
    : backendEndpointForClient;

if (
  process &&
  process.env &&
  process.env.ENABLE_K8 != null &&
  process.env.ENABLE_K8 == 'true'
) {
  var ENABLE_K8 = true;
} else {
  var ENABLE_K8 = false;
}

var K8_settings = {
  DB_SERVICE_NAME: 'db-service',
  BACKEND_SERVICE_NAME: 'backend-service',
};

function getDBsettings() {
  if (ENABLE_K8 == true) {
    return {
      DB: 'mongodb://db-service/foodabledb',
      DB_CONNECT_URL: 'mongodb://db-service:27017/',
      DB_NAME: 'foodabledb',
      DB_FULL_URL: 'mongodb://db-service:27017/foodlabdb',
    };
  } else {
    if (process.env && process.env.ENV != null && process.env.ENV == 'docker') {
      return {
        DB: 'mongodb://mongo/foodabledb',
        DB_CONNECT_URL: 'mongodb://mongo/',
        DB_NAME: 'foodabledb',
        DB_FULL_URL: 'mongodb://mongo/foodlabdb',
      };
    } else {
      return {
        DB: 'mongodb://mongo/foodabledb',
        DB_CONNECT_URL: 'mongodb://localhost:27017/',
        DB_NAME: 'foodabledb',
        DB_FULL_URL: 'mongodb://localhost:27017/foodlabdb',
      };
    }
  }
}

function get_K8_BackendEndpoint() {
  if (ENABLE_K8 == true) {
    if (isServerRequest) {
      return 'http://backend-service:4000/';
    } else {
      return 'http://192.168.64.3:30004/graphql';
    }
    return 'http://backend-service:4000/';
  } else {
    return 'http://localhost:4000/';
  }
}

var puppeteerSettings = {
  PUPPETEER_BROWSER_ISHEADLESS: true,
  PUPPETEER_BROWSER_ARGS: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36',
  ],
  PUPPETEER_VIEWPORT: { width: 1400, height: 800 },
  PUPPETEER_GOTO_PAGE_ARGS: {
    timeout: 35000, // 15seconds
    waitUntil: ['networkidle0', 'load'],
  },
};
var mongoSettings = {
  USE_ONE_GLOBAL_COLLECTION: true,
  DB: getDBsettings().DB,
  DB_CONNECT_URL: getDBsettings().DB_CONNECT_URL,
  DB_NAME: getDBsettings().DB_NAME,
  DB_FULL_URL: getDBsettings().DB_FULL_URL,
  MONGO_COLLECTION_NAME: 'collection_',
  SUBSCRIPTION_MONGO_COLLECTION_NAME: 'subscriptions',
  CONTACTUS_MONGO_COLLECTION_NAME: 'contactus',
};
var scraperSettings = {
  // TEST MODE TOGGLE - this runs only a subset of results
  SCRAPER_TEST_MODE: true,
  // MAX PAGES TO SCRAPE
  SCRAPER_MAX_PAGE: function(scraperName) {
    if (this.SCRAPER_TEST_MODE) return 2;
    if (scraperName == 'zomato') return 25;
    if (scraperName == 'talabat') return 5;
    if (scraperName == 'carriage') return 25;
    if (scraperName == 'deliveroo') return 5;
    if (scraperName == 'ubereats') return 5;
    return 5;
  },
  // Max number of multi tabs to open at a time
  get SCRAPER_NUMBER_OF_MULTI_TABS() {
    return this.SCRAPER_TEST_MODE ? 1 : 5;
  },

  SCRAPER_SLEEP_BETWEEN_TAB_BATCH: 8000,

  // SCRAPER INDIVIDUAL TOGGLE
  ENABLE_TALABAT: true,
  ENABLE_UBEREATS: false,
  ENABLE_ZOMATO: true,
  ENABLE_DELIVEROO: true,
  ENABLE_CARRIAGE: true,
};
var systemSettings = {
  BACKEND_ENDPOINT:
    ENABLE_K8 == true ? get_K8_BackendEndpoint() : DOCKER_BACKEND_ENDPOINT,
  PORT: 4000,
};

module.exports = Object.assign(
  {},
  puppeteerSettings,
  mongoSettings,
  scraperSettings,
  systemSettings
);
