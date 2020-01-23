var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLList = require('graphql').GraphQLList;
var GraphQLString = require('graphql').GraphQLString;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLInt = require('graphql').GraphQLInt;
var EntityModel = require('./Entity');
var entityType = require('./EntityType').entityType;
var tagType = require('./EntityType').tagType;
var _ = require('lodash');

function getProjection(fieldASTs) {
  return fieldASTs.fieldNodes[0].selectionSet.selections.reduce((projections, selection) => {
    projections[selection.name.value] = 1;
    return projections;
  }, {});
}

// Queries
exports.EntityQuery = new GraphQLObjectType({
  name: 'Query',
  fields: () => {
    return {
      // GET ALL LOCATIONS WITH OFFERS
      locationsWithOffers: {
        type: new GraphQLList(entityType),
        args: {},
        resolve: async (root, args, context, info) => {
          const projections = getProjection(info);
          const items = await EntityModel.aggregate([
            { $match: { type: 'offers' } },
            {
              $group: {
                _id: '$locationSlug',
                locationSlug: {
                  $first: '$locationSlug',
                },
                locationName: {
                  $first: '$locationName',
                },
                city: {
                  $first: '$city',
                },
              },
            },
            { $sort: { locationName: 1 } },
          ]).exec();
          if (!items) {
            throw new Error('Error while fetching locationWithOffers data.');
          }

          return items;
        },
      },
      // GET A RANDOM SAMPLE OF OFFERS
      randomOffers: {
        type: new GraphQLList(entityType),
        args: {
          pageSize: { type: GraphQLInt },
          page: { type: GraphQLInt },
          locationSlug: { type: GraphQLNonNull(GraphQLString) },
          count: { type: GraphQLNonNull(GraphQLInt) },
          city: { type: GraphQLNonNull(GraphQLString) },
        },
        resolve: async (root, args, context, info) => {
          const { pageSize, page, locationSlug, count, city } = args;
          const projections = getProjection(info);
          const items = await EntityModel.aggregate([
            { $match: { type: 'restaurant', locationSlug: args.locationSlug, city: args.city } },
            { $sample: { size: args.count } },
          ])
            .skip(pageSize * (page - 1))
            .limit(pageSize)
            .exec();
          if (!items) {
            throw new Error('Error while fetching random offers data.');
          }

          return items;
        },
      },
      // OFFERS: GET ALL OFFERS IN A LOCATION
      offers: {
        type: new GraphQLList(entityType),
        args: {
          pageSize: { type: GraphQLInt },
          page: { type: GraphQLInt },
          locationSlug: { type: GraphQLNonNull(GraphQLString) },
          keywords: { type: GraphQLString },
          cuisine: { type: GraphQLString },
          city: { type: GraphQLNonNull(GraphQLString) },
        },
        resolve: async (root, args, context, info) => {
          const { pageSize, page, locationSlug, keywords, cuisine, city } = args;

          if (cuisine || keywords) {
            var orFilter = [];
            var andFilter = [];
            var matchObj = {
              type: 'offers',
              locationSlug: locationSlug,
              city: city,
            };
            if (cuisine) {
              cuisine.split(' ').forEach(function(item, index) {
                // since its a query param a space in the item comes in as a -
                // Example healthy-food
                item = item.replace('-', ' ');

                orFilter.push({
                  'offers.cuisine': { $regex: item, $options: 'gi' },
                });
              });
              matchObj['$or'] = orFilter;
            }
            if (keywords) {
              keywords.split(' ').forEach(function(item, index) {
                andFilter.push({
                  'offers.title': { $regex: item, $options: 'gi' },
                });
              });
              matchObj['$and'] = andFilter;
            }
            var items = await EntityModel.aggregate([
              {
                $match: matchObj,
              },
              { $unwind: '$offers' },
              {
                $project: {
                  added: 0,
                },
              },
              {
                $group: {
                  _id: '$slug',
                  offers: { $addToSet: '$offers' },
                },
              },
              { $sort: { 'offers.0.scoreLevel': -1, _id: 1 } },
            ])
              .skip(pageSize * (page - 1))
              .limit(pageSize)
              .exec();
            if (!items) {
              throw new Error('Error while fetching "all" offers data.');
            }
          } else {
            // DEFAULT
            var items = await EntityModel.aggregate([
              { $match: { type: 'offers', locationSlug: args.locationSlug, city: args.city } },
              { $unwind: '$offers' },
              {
                $project: {
                  added: 0,
                },
              },
              {
                $group: {
                  _id: '$slug',
                  offers: { $addToSet: '$offers' },
                },
              },
              { $sort: { 'offers.0.scoreLevel': -1, 'offers.0.sortSpread': -1, _id: 1 } },
            ])
              .skip(pageSize * (page - 1))
              .limit(pageSize)
              .exec();
            if (!items) {
              throw new Error('Error while fetching "all" offers data.');
            }
          } // close else

          items.forEach(item => {
            if (item.offers.length > 1) {
              // sort them
              item.offers = item.offers.sort((a, b) => {
                return (
                  Number(b.scoreLevel) - Number(a.scoreLevel) ||
                  parseFloat(b.scoreValue) - parseFloat(a.scoreValue) ||
                  Number(b.sortSpread) - Number(a.sortSpread)
                );
              });

              // remove dups by key {offer}-{source}
              item.offers = _.uniqBy(item.offers, offer => [offer.offer, offer.source].join());
            }
          });

          // sort by offer score over all items.
          items.sort(function(a, b) {
            return (
              Number(b.offers[0].scoreLevel) - Number(a.offers[0].scoreLevel) ||
              Number(b.offers[0].sortSpread) - Number(a.offers[0].sortSpread) ||
              parseFloat(b.offers[0].scoreValue) - parseFloat(a.offers[0].scoreValue) ||
              b.offers.length - a.offers.length
            );
          });
          return items;
        },
      },
      // ==========================================================
      // Favourites!
      favourites: {
        type: new GraphQLList(entityType),
        args: {
          pageSize: { type: GraphQLInt },
          page: { type: GraphQLInt },
          locationSlug: { type: GraphQLNonNull(GraphQLString) },
          favourites: { type: GraphQLNonNull(new GraphQLList(GraphQLString)) },
        },
        resolve: async (root, args, context, info) => {
          const { pageSize, page, locationSlug, favourites } = args;

          var orFilter = [];
          var matchObj = {
            type: 'offers',
            locationSlug: locationSlug,
          };
          if (favourites) {
            favourites.forEach(function(item, index) {
              orFilter.push({
                slug: { $eq: item },
              });
            });
            matchObj['$or'] = orFilter;
          }

          var items = await EntityModel.aggregate([
            {
              $match: matchObj,
            },
            { $unwind: '$offers' },
            {
              $project: {
                added: 0,
              },
            },
            {
              $group: {
                _id: '$slug',
                offers: { $addToSet: '$offers' },
              },
            },
            { $sort: { 'offers.0.scoreLevel': -1, 'offers.0.scoreValue': -1, _id: 1 } },
          ])
            .skip(pageSize * (page - 1))
            .limit(pageSize)
            .exec();

          items.forEach(item => {
            if (item.offers.length > 1) {
              // sort them
              item.offers = item.offers.sort((a, b) => {
                return (
                  Number(b.scoreLevel) - Number(a.scoreLevel) || parseFloat(b.scoreValue) - parseFloat(a.scoreValue)
                );
              });

              // remove dups by key {offer}-{source}
              item.offers = _.uniqBy(item.offers, offer => [offer.offer, offer.source].join());
            }
          });

          // sort by offer score over all items.
          items.sort(function(a, b) {
            return (
              Number(b.offers[0].scoreLevel) - Number(a.offers[0].scoreLevel) ||
              parseFloat(b.offers[0].scoreValue) - parseFloat(a.offers[0].scoreValue) ||
              b.offers.length - a.offers.length
            );
          });
          return items;
        },
      },
      // ==========================================================
      // Find By Keyword
      findByKeyword: {
        type: new GraphQLList(entityType),
        args: {
          keyword: { type: GraphQLNonNull(GraphQLString) },
          pageSize: { type: GraphQLInt },
          page: { type: GraphQLInt },
          city: { type: GraphQLNonNull(GraphQLString) },
        },
        resolve: async (root, args, context, info) => {
          const { keyword, locationSlug, pageSize, page, city } = args;
          const projections = getProjection(info);
          var final = [];
          var totalCount = 0;
          var countDone = false;
          var keySplit = keyword.split(' ');
          for (var key in keySplit) {
            var restaurants = await EntityModel.find({ type: 'restaurant', city: args.city })
              .select(projections)
              .or([
                { cuisine: { $regex: keySplit[key], $options: 'i' } },
                { title: { $regex: keySplit[key], $options: 'i' } },
              ])
              .skip(page * pageSize)
              .limit(pageSize)
              .exec();
            if (!restaurants) {
              throw new Error('Error while fetching all offers data.');
            }
            restaurants.forEach(function(entity) {
              final.push(entity);
              totalCount += 1;
              if (totalCount >= pageSize) {
                countDone = true;
              }
            });
            if (countDone) {
              break;
            }
          }
          return final;
        },
      },
      // Fetch all cuisine tags
      fetchCuisine: {
        type: new GraphQLList(tagType),
        args: {
          city: { type: GraphQLNonNull(GraphQLString) },
        },
        resolve: async (root, args, context, info) => {
          const { city } = args;
          const projections = getProjection(info);
          var tags = await EntityModel.find({ type: 'cuisine', city: `${city}` }).exec();
          if (!tags) {
            throw new Error('Error while fetching all offers data.');
          }
          // sort before returning
          // we take first tags element of array since it
          // comes back as a graphql list of one element.
          tags[0].tags.sort();
          return tags;
        },
      },
    };
  },
});
