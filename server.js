// app config
const express = require('express');
const app = express();
const PORT = 4000; // application serves at port

// db config
const mongodb = require('mongodb');
const config = require('./db');
const client = mongodb.MongoClient;
client.connect(config.DB, { useNewUrlParser: true }, function(err, db) {
    if(err) {
        console.log('Error: Database is not connected.')
    }
    else {
        console.log('Success: Database is connected!')
    }
});

// API endpoints
app.get('/', function(req, res) {
    res.json({"hello": "world"});
});

app.listen(PORT, function(){
    console.log('Your server is running on PORT:',PORT);
});