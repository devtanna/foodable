// Global app settings
var currentdate = new Date(); 
var datetime = currentdate.getDate() + "_"
                + (currentdate.getMonth()+1)  + "_" 
                + currentdate.getFullYear();

if(process.env.ENABLE_K8 && process.env.ENABLE_K8 == 'true') { 
    ENABLE_K8 = true; 
}
else { 
    ENABLE_K8 = false; 
}

K8_settings = {
    DB_SERVICE_NAME: 'db-service',
    BACKEND_SERVICE_NAME: 'backend-service'
}

function getDBsettings(){
    if (ENABLE_K8 == true){
        return {
            DB: 'mongodb://db-service/foodabledb',
            DB_CONNECT_URL: 'mongodb://db-service:27017/',
            DB_NAME: 'foodabledb',
            DB_FULL_URL: 'mongodb://db-service:27017/foodlabdb'
        }
    } else {
        return {
            DB: 'mongodb://mongo/foodabledb',
            DB_CONNECT_URL: 'mongodb://localhost:27017/',
            DB_NAME: 'foodabledb',
            DB_FULL_URL: 'mongodb://localhost:27017/foodlabdb'
        }
    }
}

function getBackendEndpoint(){
    if (ENABLE_K8 == true){
        return 'http://backend-service:4000/'
    } else {
        return 'http://localhost:4000/'
    }
}

module.exports = {
    BACKEND_ENDPOINT: getBackendEndpoint(),
    DB: getDBsettings().DB,
    DB_CONNECT_URL: getDBsettings().DB_CONNECT_URL,
    DB_NAME: getDBsettings().DB_NAME,
    DB_FULL_URL: getDBsettings().DB_FULL_URL,
    PORT: 4000,
    PUPPETEER_BROWSER_ARGS: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36'
    ],
    PUPPETEER_VIEWPORT: { width: 1400, height: 800 },
    PUPPETEER_BROWSER_ISHEADLESS: true,
    PUPPETEER_GOTO_PAGE_ARGS: {timeout: 35000, waitUntil: ['networkidle0', 'load']},
    MONGO_COLLECTION_NAME: 'collection_',
    SCRAPER_COLLECTION_NAME: 'collection_' + datetime,
    MONGO_MODEL_NAME: 'Entity'
}
