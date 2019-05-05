// Global app settings

module.exports = {
    DB: 'mongodb://mongo/foodabledb',
    DB_CONNECT_URL: 'mongodb://localhost:27017/',
    DB_NAME: 'foodabledb',
    DB_FULL_URL: 'mongodb://localhost:27017/foodlabdb',
    PORT: 4000,
    PUPPETEER_BROWSER_ARGS: [
        '--no-sandbox', 
        '--disable-setuid-sandbox', 
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/68.0.3440.75 Safari/537.36'
    ],
    PUPPETEER_VIEWPORT: { width: 1400, height: 800 },
    PUPPETEER_BROWSER_ISHEADLESS: false,
    PUPPETEER_GOTO_PAGE_ARGS: {timeout: 35000, waitUntil: ['networkidle0', 'load']},
    MONGO_COLLECTION_NAME: 'collection_',
    MONGO_MODEL_NAME: 'Entity'
}
