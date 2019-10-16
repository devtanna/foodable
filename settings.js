// Global app settings
const slackApiToken = 'xoxp-690095593765-691933474583-748104240066-f158dc195bad901199a9ccad63c40cc7';
const slackLogBotChanelId = 'CLPT6LL3C';
const slackLogBotLogsChanelId = 'CPFFZAN04';
const isServerRequest = process && process.env && process.env.HOSTNAME != null;
const backendEndpointForClient = 'http://foodable.local:8090/graphql';
const backendEndpointForServer = 'http://foodable:4000/graphql';
var DOCKER_BACKEND_ENDPOINT =
  isServerRequest != null && isServerRequest == true ? backendEndpointForServer : backendEndpointForClient;

function getDBsettings() {
  if (process.env && process.env.MONGO_ENV != null && process.env.MONGO_ENV == 'atlas') {
    var atlasConnection = 'mongodb+srv://devtanna:K4eh5Ds2MrDkAk5I@foodable-cluster0-zyyjg.gcp.mongodb.net';
    return {
      DB: atlasConnection + '/foodabledb?retryWrites=true&w=majority',
      DB_CONNECT_URL: atlasConnection,
      DB_NAME: 'foodabledb',
      DB_FULL_URL: atlasConnection + '/foodlabdb?retryWrites=true&w=majority',
    };
  }
  if (process.env && process.env.ENV != null && process.env.ENV == 'localhost') {
    return {
      DB: 'mongodb://localhost/foodabledb',
      DB_CONNECT_URL: 'mongodb://localhost/',
      DB_NAME: 'foodabledb',
      DB_FULL_URL: 'mongodb://localhost/foodlabdb',
    };
  }
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

var puppeteerSettings = {
  PUPPETEER_BROWSER_ISHEADLESS: true,
  PUPPETEER_BROWSER_ARGS: [
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-zygote',
    '--no-first-run',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36',
  ],
  PUPPETEER_VIEWPORT: { width: 1400, height: 800 },
  PUPPETEER_GOTO_PAGE_ARGS: {
    timeout: 35000, // 15seconds
    waitUntil: ['load'],
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
  SCRAPER_TEST_MODE: false,
  // MAX PAGES TO SCRAPE
  SCRAPER_MAX_PAGE: function(scraperName) {
    if (this.SCRAPER_TEST_MODE) return 5;
    if (scraperName == 'zomato') return 50;
    if (scraperName == 'talabat') return 5;
    if (scraperName == 'carriage') return 25;
    if (scraperName == 'deliveroo') return 5;
    if (scraperName == 'ubereats') return 5;
    if (scraperName == 'eateasy') return 5;
    return 5;
  },
  // Max number of multi tabs to open at a time
  get SCRAPER_NUMBER_OF_MULTI_TABS() {
    return this.SCRAPER_TEST_MODE ? 1 : 3;
  },

  SCRAPER_SLEEP_BETWEEN_TAB_BATCH: 8000,

  // SCRAPER INDIVIDUAL TOGGLE
  ENABLE_TALABAT: true,
  ENABLE_UBEREATS: true,
  ENABLE_ZOMATO: true,
  ENABLE_DELIVEROO: true,
  ENABLE_CARRIAGE: true,
  ENABLE_EATEASY: true,
  MAX_TABS: 5,
};

var systemSettings = {
  BACKEND_ENDPOINT: get_backendEndpoint(),
  PORT: 4000,
  SLACK_API_TOKEN: slackApiToken,
  SLACK_LOG_BOT_CHANEL_ID: slackLogBotChanelId,
  SLACK_LOG_BOT_LOGS_CHANEL_ID: slackLogBotLogsChanelId
};

var devSettings = Object.assign({}, puppeteerSettings, mongoSettings, scraperSettings, systemSettings);

////////////////////////////////////////////////////////////////
////////// Warning!! These are production settings ////////////
////////////////////////////////////////////////////////////////
function get_backendEndpoint() {
  if (process.env.NODE_ENV == 'production') {
    return get_Azure_BackendEndpoint();
  }
  if (process.env.ENABLE_AZURE == 'true') {
    return get_Azure_BackendEndpoint();
  }
  return DOCKER_BACKEND_ENDPOINT;
}
function get_Azure_BackendEndpoint() {
  if (isServerRequest) {
    return 'http://localhost:4000/graphql';
  } else {
    return 'http://foodable.ae/graphql';
  }
  return 'http://localhost:4000/graphql';
}

var prodSettings = Object.assign({}, devSettings, systemSettings, scraperSettings);
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

module.exports = function() {
  switch (process.env.NODE_ENV) {
    case 'development':
      return devSettings;

    case 'production':
      return prodSettings;

    default:
      return prodSettings;
  }
};
