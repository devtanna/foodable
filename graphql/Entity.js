// mongo schema file
var mongoose = require('mongoose');
var settings = require('../settings');
var Schema = mongoose.Schema;

var EnityModelSchema = new Schema({
        type: {
            type: String,
            text: true,
            index: true,
            required: false
        },
        title: {
            type: String,
            text: true,
            index: true,
            required: false
        },
        href:{
            type:String,
            text: true,
            required:false
        },
        image:{
            type:String,
            text: true,
            required:false
        },
        location:{
            type:String,
            text: true,
            index: true,
            required:false
        },
        address:{
            type:String,
            text: true,
            index: true,
            required:false
        },
        cuisine:{
            type:String,
            text: true,
            index: true,
            required:false
        },
        offer:{
            type:String,
            text: true,
            required:false
        },
        rating:{
            type:String,
            text: true,
            required:false
        },
        votes:{
            type:String,
            text: true,
            required:false
        },
        cost_for_two:{
            type:String,
            text: true,
            required:false
        },
        slug:{
            type:String,
            text: true,
            required:false
        },
        source:{
            type:String,
            text: true,
            index: true,
            required:false
        },
        locationId:{
            type:String,
            text: true,
            index: true,
            required:false
        },
        locationName:{
            type:String,
            text: true,
            index: true,
            required:false
        },
        locationSlug:{
            type:String,
            text: true,
            index: true,
            required:false
        },
        _id:{
            type:String,
            text: true,
            index: false,
            required:false
        }
});

// Define the indexes
EnityModelSchema.index({"cuisine": 1, "title": 1, "slug": 1, "locationSlug": 1, 'type': 1});

var currentdate = new Date(); 
var datetime = currentdate.getDate() + "_"
            + (currentdate.getMonth()+1)  + "_" 
            + currentdate.getFullYear();
var locationCollectionName = settings.MONGO_COLLECTION_NAME + datetime;
var Model = mongoose.model(locationCollectionName, EnityModelSchema);
module.exports = Model;