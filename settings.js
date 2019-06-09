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
    return 'http://backend-service:4000/';
  } else {
    return 'http://localhost:4000/';
  }
}

module.exports = {
  SCRAPER_TEST_MODE: true, // important toggle to run just a subset of scrapes or all of them
  ENABLE_MEAL_TIME_ZOME: false,
  BACKEND_ENDPOINT:
    ENABLE_K8 == true ? getBackendEndpoint() : DOCKER_BACKEND_ENDPOINT,
  DB: getDBsettings().DB,
  DB_CONNECT_URL: getDBsettings().DB_CONNECT_URL,
  DB_NAME: getDBsettings().DB_NAME,
  DB_FULL_URL: getDBsettings().DB_FULL_URL,
  PORT: 4000,
  PUPPETEER_BROWSER_ARGS: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36',
  ],
  PUPPETEER_VIEWPORT: { width: 1400, height: 800 },
  PUPPETEER_BROWSER_ISHEADLESS: true,
  PUPPETEER_GOTO_PAGE_ARGS: {
    timeout: 35000,
    waitUntil: ['networkidle0', 'load'],
  },
  MONGO_COLLECTION_NAME: 'collection_',
  SUBSCRIPTION_MONGO_COLLECTION_NAME: 'subscriptions',
  CONTACTUS_MONGO_COLLECTION_NAME: 'contactus',
  SCRAPER_COLLECTION_NAME: 'collection_' + datetime,
  MONGO_MODEL_NAME: 'Entity',
};
