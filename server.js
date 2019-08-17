const express = require('express');
const mongoose = require('mongoose');
const graphqlExpress = require('express-graphql');
const dbHelper = require('./helpers/db');
const settings = require('./settings')();
const validators = require('./helpers/validators');
const bodyParser = require('body-parser');
const scraperDbHelper = require('./scraper/db');
const entitySchema = require('./graphql/EntitySchema').EntitySchema;
const next = require('next');
const path = require('path');
const compression = require('compression');
const device = require('express-device');
const { sitemap } = require('./sitemap');
const nodemailer = require('nodemailer');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

// Connecting to mongodb:
// we need this as we need to open a connection to the db for api calls
// this connection is separate from the scraper connections
mongoose.connect(settings.DB, { useCreateIndex: true, useNewUrlParser: true }, (err, client) => {
  if (err) throw err;
  console.log('connected to mongo :) dbname:', settings.DB);

  // small check to see if the db has the current active collection
  client.db.listCollections().toArray(function(err, collections) {
    var lastCollectionInDb = collections.sort()[collections.length - 1]['name'];
    if (!scraperDbHelper.checkDBhasActiveCollection(collections)) {
      console.log('<< DB does NOT have the current active collection! :( >>');
    } else {
      console.log('<< DB active collection exists! :) >> "' + lastCollectionInDb + '"');
    }
  });
});

app
  .prepare()
  .then(() => {
    const server = express();

    server.use(compression());
    server.use(device.capture());
    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));

    server.get('/public/hc', (req, res) => {
      res.send("we're ✈");
    });

    server.use(
      '/graphql',
      (req, res, next) => {
        console.log('Request from: ' + req['headers']['host'], ' and origin ', req['headers']['origin']);
        // check who is sending the request
        // var block_request = false;
        // // if (req['headers']['host'].indexOf('localhost') < 0) {
        // //   block_request = true;
        // //   // could be a browser request
        // //   if (
        // //     req['headers']['origin'] != null &&
        // //     req['headers']['origin'].indexOf('foodable') > 0
        // //   ) {
        // //     block_request = false;
        // //   }
        // // }

        // if (block_request == true) {
        //   return res.sendStatus(404);
        // }

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
    server.post('/subscribe', (req, res) => {
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
    server.post('/contactus', async (req, res) => {
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

      try {
        const MAILER_SETUP = {
          service: 'gmail',
          port: 587,
          secure: false,
          auth: {
            user: 'foodable.ae@gmail.com',
            pass: 'fdb4life',
          },
        };

        let transporter = nodemailer.createTransport(MAILER_SETUP);

        await transporter.sendMail({
          from: 'foodable.ae@gmail.com',
          to: 'foodable.ae@gmail.com',
          subject: `Message from: ${req.body.email}`,
          text: req.body.message,
        });
      } catch (e) {
        console.error(e);
        return res.status(500).end();
      }

      return res.status(201).send({
        success: 'true',
        message: 'Contact-us entry added successfully.',
      });
    });

    server.get('/robots.txt', (req, res) => {
      const options = {
        root: path.join(__dirname, '/static'),
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
      };
      res.status(200).sendFile(req.url, options);
    });

    server.get('/service-worker.js', (req, res) => {
      const options = {
        root: path.join(__dirname, '.next'),
        headers: {
          'Content-Type': 'text/javascript',
        },
      };
      res.status(200).sendFile(req.url, options);
    });

    server.get('/sitemap.xml', function(req, res) {
      try {
        const xml = sitemap.toXML();
        res.header('Content-Type', 'application/xml');
        res.send(xml);
      } catch (e) {
        consol.error(e);
        return res.status(500).end();
      }
    });

    server.get('*', (req, res) => {
      res.cookie('fdb_device', req.device.type);
      return handle(req, res);
    });

    // points to 4000
    server.set('port', settings.PORT);
    server.listen(server.get('port'), () => {
      console.log('Server is running at localhost:', server.get('port'), ' for NODE_ENV:', process.env.NODE_ENV);
    });
  })
  .catch(ex => {
    console.error(ex.stack);
    process.exit(1);
  });
