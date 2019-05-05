const express = require('express');
const app = express();
const mongoose = require('mongoose');
const graphqlExpress = require("express-graphql");

const settings = require('./settings');
const entitySchema = require('./graphql/EntitySchema').EntitySchema;

// Connecting to mongodb:
// we need this as we need to open a connection to the db for api calls
// this connection is separate from the scraper connections
mongoose.connect(settings.DB, { useNewUrlParser: true }, (err)=>{
    if (err) throw err;
    console.log("connected to mongo :)");
})  

app.set('port', settings.PORT);
app.listen(app.get('port'), ()=> {
    console.log("Server is running at localhost:" + app.get('port'))
});

// Graph iQL Endpoint 
app.use('/graphql', graphqlExpress({
    schema: entitySchema,
    graphiql: true
}));