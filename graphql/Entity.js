// mongo schema file
var mongoose = require('mongoose');
var settings = require('../settings')();
const dbutils = require('../scraper/db');

var Schema = mongoose.Schema;

var OfferModelSchema = new Schema({
  type: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  title: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  score: {
    type: Number,
    text: true,
    index: false,
    required: false,
  },
  added: {
    type: Number,
    text: true,
    index: false,
    required: false,
  },
  href: {
    type: String,
    text: true,
    required: false,
  },
  image: {
    type: String,
    text: true,
    required: false,
  },
  location: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  address: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  cuisine: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  offer: {
    type: String,
    text: true,
    required: false,
  },
  rating: {
    type: String,
    text: true,
    required: false,
  },
  votes: {
    type: String,
    text: true,
    required: false,
  },
  cost_for_two: {
    type: String,
    text: true,
    required: false,
  },
  deliveryCharge: {
    type: String,
    text: true,
    required: false,
  },
  minimumOrder: {
    type: String,
    text: true,
    required: false,
  },
  deliveryTime: {
    type: String,
    text: true,
    required: false,
  },
  slug: {
    type: String,
    text: true,
    required: false,
  },
  source: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  locationId: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  locationName: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  locationSlug: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  _id: {
    type: String,
    text: true,
    index: false,
    required: false,
  },
});

var EnityModelSchema = new Schema({
  type: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  title: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  score: {
    type: Number,
    text: true,
    index: false,
    required: false,
  },
  href: {
    type: String,
    text: true,
    required: false,
  },
  image: {
    type: String,
    text: true,
    required: false,
  },
  location: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  address: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  cuisine: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  offer: {
    type: String,
    text: true,
    required: false,
  },
  rating: {
    type: String,
    text: true,
    required: false,
  },
  votes: {
    type: String,
    text: true,
    required: false,
  },
  cost_for_two: {
    type: String,
    text: true,
    required: false,
  },
  slug: {
    type: String,
    text: true,
    required: false,
  },
  source: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  locationId: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  locationName: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  locationSlug: {
    type: String,
    text: true,
    index: true,
    required: false,
  },
  _id: {
    type: String,
    text: true,
    index: false,
    required: false,
  },
  deliveryCharge: {
    type: String,
    text: true,
    index: false,
    required: false,
  },
  minimumOrder: {
    type: String,
    text: true,
    index: false,
    required: false,
  },
  deliveryTime: {
    type: String,
    text: true,
    index: false,
    required: false,
  },
  added: {
    type: Number,
    text: true,
    index: false,
    required: false,
  },
  offers: {
    type: [OfferModelSchema],
    index: false,
    required: false,
    default: [],
  },
  tags: {
    type: [String],
    index: false,
    required: false,
    default: [],
  },
});

// Define the indexes
EnityModelSchema.index({
  cuisine: 1,
  title: 1,
  slug: 1,
  locationSlug: 1,
  type: 1,
  added: 1,
});
OfferModelSchema.index({
  cuisine: 1,
  title: 1,
  slug: 1,
  locationSlug: 1,
  type: 1,
});

var locationCollectionName = dbutils.getCurrentDBCollection();

var Model = mongoose.model(locationCollectionName, EnityModelSchema);

module.exports = Model;
