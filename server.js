const express = require('express');
const mongoose = require('mongoose');
const graphqlExpress = require("express-graphql");
const dbHelper = require('./helpers/db');
const settings = require('./settings');
const validators = require('./helpers/validators');
const bodyParser = require("body-parser");
const scraperDbHelper = require('./scraper/db');
const entitySchema = require('./graphql/EntitySchema').EntitySchema;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connecting to mongodb:
// we need this as we need to open a connection to the db for api calls
// this connection is separate from the scraper connections
mongoose.connect(settings.DB, { useCreateIndex: true, useNewUrlParser: true }, (err, client)=>{
    if (err) throw err;
    console.log("BackendServer: connected to mongo :) dbname:", settings.DB);

    // small check to see if the db has the current active collection
    client.db.listCollections().toArray(function(err, collections) {
        if (!scraperDbHelper.checkDBhasActiveCollection(collections)){
            console.log('BackendServer: << DB does NOT have the current active collection! :( >>');
        } else {
            console.log('BackendServer: << DB active collection exists! :) >>');
        }
    });
})  

// points to 4000
app.set('port', settings.PORT);
app.listen(app.get('port'), ()=> {
    console.log("BackendServer: Server is running at localhost:" + app.get('port'))
});

// ========================================= ROUTES ====================================================================
// Graph iQL Endpoint 
app.use('/graphql', graphqlExpress({
    schema: entitySchema,
    graphiql: true
}));

// Simple Email Subscribe Endpoint + VALIDATION
app.post('/subscribe', (req, res) => {
  if(!req.body.email) {
    return res.status(400).send({
      success: 'false',
      message: 'email is required.'
    });
  }
  if( !validators.validateEmail(req.body.email) ){
    return res.status(400).send({
      success: 'false',
      message: 'email is not valid.'
    });
  }

 dbHelper.insertOneEntryIntoMongo(
    {'email': req.body.email, 'added': new Date()},
    settings.SUBSCRIPTION_MONGO_COLLECTION_NAME
 )

 return res.status(201).send({
   success: 'true',
   message: 'Email '+req.body.email+' added successfully.'
 });
});

// Simple ContactUs Endpoint + VALIDATION
app.post('/contactus', (req, res) => {
  console.log(req.body);
  if(!req.body.email) {
    return res.status(400).send({
      success: 'false',
      message: 'email is required.'
    });
  }
  if(!req.body.message || req.body.message.length <= 0) {
    return res.status(400).send({
      success: 'false',
      message: 'message is required.'
    });
  }
  if( !validators.validateEmail(req.body.email) ){
    return res.status(400).send({
      success: 'false',
      message: 'email is not valid.'
    });
  }

 dbHelper.insertOneEntryIntoMongo(
    {'email': req.body.email, 'message': req.body.message, 'added': new Date()},
    settings.CONTACTUS_MONGO_COLLECTION_NAME
 )

 return res.status(201).send({
   success: 'true',
   message: 'Contact-us entry added successfully.'
 });
});

