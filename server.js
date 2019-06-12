const express = require('express');
const mongoose = require('mongoose');
const graphqlExpress = require('express-graphql');
const dbHelper = require('./helpers/db');
const settings = require('./settings');
const validators = require('./helpers/validators');
const bodyParser = require('body-parser');
const scraperDbHelper = require('./scraper/db');
const entitySchema = require('./graphql/EntitySchema').EntitySchema;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connecting to mongodb:
// we need this as we need to open a connection to the db for api calls
// this connection is separate from the scraper connections
mongoose.connect(
  settings.DB,
  { useCreateIndex: true, useNewUrlParser: true },
  (err, client) => {
    if (err) throw err;
    console.log('BackendServer: connected to mongo :) dbname:', settings.DB);

    // small check to see if the db has the current active collection
    client.db.listCollections().toArray(function(err, collections) {
      var lastCollectionInDb = collections.sort()[collections.length - 1][
        'name'
      ];
      if (!scraperDbHelper.checkDBhasActiveCollection(collections)) {
        console.log(
          'BackendServer: << DB does NOT have the current active collection! :( >>'
        );
      } else {
        console.log(
          'BackendServer: << DB active collection exists! :) >> "' +
            lastCollectionInDb +
            '"'
        );
      }
    });
  }
);

// points to 4000
app.set('port', settings.PORT);
app.listen(app.get('port'), () => {
  console.log(
    'BackendServer: Server is running at localhost:' + app.get('port')
  );
});

// ========================================= ROUTES ====================================================================

app.use(
  '/graphql',
  (req, res, next) => {
    // check who is sending the request
    var block_request = false;
    if (req['headers']['host'] != 'foodable_back:4000') {
      block_request = true;
      // could be a browser request
      if (
        req['headers']['origin'] != null &&
        req['headers']['origin'].indexOf('foodable') > 0
      ) {
        block_request = false;
      }
    }

    if (block_request == true) {
      return res.sendStatus(404);
    }

    // all ok lets proceed with request
    res.header('Access-Control-Allow-Credentials', true);
    res.header(
      'Access-Control-Allow-Headers',
      'content-type, authorization, content-length, x-requested-with, accept, origin'
    );
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Allow', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  },
  graphqlExpress({
    schema: entitySchema,
    graphiql: true,
  })
);

// Simple Email Subscribe Endpoint + VALIDATION
app.post('/subscribe', (req, res) => {
  if (!req.body.email) {
    return res.status(400).send({
      success: 'false',
      message: 'email is required.',
    });
  }
  if (!validators.validateEmail(req.body.email)) {
    return res.status(400).send({
      success: 'false',
      message: 'email is not valid.',
    });
  }

  dbHelper.insertOneEntryIntoMongo(
    { email: req.body.email, added: new Date() },
    settings.SUBSCRIPTION_MONGO_COLLECTION_NAME
  );

  return res.status(201).send({
    success: 'true',
    message: 'Email ' + req.body.email + ' added successfully.',
  });
});

// Simple ContactUs Endpoint + VALIDATION
app.post('/contactus', (req, res) => {
  console.log(req.body);
  if (!req.body.email) {
    return res.status(400).send({
      success: 'false',
      message: 'email is required.',
    });
  }
  if (!req.body.message || req.body.message.length <= 0) {
    return res.status(400).send({
      success: 'false',
      message: 'message is required.',
    });
  }
  if (!validators.validateEmail(req.body.email)) {
    return res.status(400).send({
      success: 'false',
      message: 'email is not valid.',
    });
  }

  dbHelper.insertOneEntryIntoMongo(
    { email: req.body.email, message: req.body.message, added: new Date() },
    settings.CONTACTUS_MONGO_COLLECTION_NAME
  );

  return res.status(201).send({
    success: 'true',
    message: 'Contact-us entry added successfully.',
  });
});
