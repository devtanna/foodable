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
  return fieldASTs.fieldNodes[0].selectionSet.selections.reduce(
    (projections, selection) => {
      projections[selection.name.value] = 1;
      return projections;
    },
    {}
  );
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
        },
        resolve: async (root, args, context, info) => {
          const { pageSize, page, locationSlug, count } = args;
          const projections = getProjection(info);
          const items = await EntityModel.aggregate([
            { $match: { type: 'restaurant', locationSlug: args.locationSlug } },
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
        },
        resolve: async (root, args, context, info) => {
          const { pageSize, page, locationSlug, keywords, cuisine } = args;

          var results = [];
          if (cuisine || keywords) {
            var orFilter = [];
            if (cuisine) {
              cuisine.split(' ').forEach(function(item, index) {
                orFilter.push({
                  'offers.cuisine': { $regex: item, $options: 'gi' },
                });
              });
            }
            if (keywords) {
              keywords.split(' ').forEach(function(item, index) {
                orFilter.push({
                  'offers.title': { $regex: item, $options: 'gi' },
                });
              });
            }
            var items = await EntityModel.aggregate([
              {
                $match: {
                  type: 'offers',
                  locationSlug: args.locationSlug,
                  $or: orFilter,
                },
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
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
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
              { $match: { type: 'offers', locationSlug: args.locationSlug } },
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
                  count: { $sum: 1 },
                },
              },
              { $sort: { count: -1 } },
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
                  parseFloat(b.scoreValue) - parseFloat(a.scoreValue)
                );
              });

              // remove dups by key {offer}-{source}
              item.offers = _.uniqBy(item.offers, offer =>
                [offer.offer, offer.source].join()
              );
            }
          });

          // sort by count of offers list length. can only be done after removing duplicates above.
          items.sort(function(one, other) {
            return other['offers'].length - one['offers'].length;
          });

          return items;
        },
      },
      // Find By Keyword
      findByKeyword: {
        type: new GraphQLList(entityType),
        args: {
          keyword: { type: GraphQLNonNull(GraphQLString) },
          pageSize: { type: GraphQLInt },
          page: { type: GraphQLInt },
        },
        resolve: async (root, args, context, info) => {
          const { keyword, locationSlug, pageSize, page } = args;
          const projections = getProjection(info);
          var final = [];
          var totalCount = 0;
          var countDone = false;
          var keySplit = keyword.split(' ');
          for (var key in keySplit) {
            var restaurants = await EntityModel.find({ type: 'restaurant' })
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
        args: {},
        resolve: async (root, args, context, info) => {
          const projections = getProjection(info);
          var tags = await EntityModel.find({ type: 'cuisine' }).exec();
          if (!tags) {
            throw new Error('Error while fetching all offers data.');
          }
          return tags;
        },
      },
    };
  },
});
