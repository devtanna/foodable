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
                _id: '$locationId',
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
      // GET ALL OFFERS IN A LOCATION
      offers: {
        type: new GraphQLList(entityType),
        args: {
          pageSize: { type: GraphQLInt },
          page: { type: GraphQLInt },
          locationSlug: { type: GraphQLNonNull(GraphQLString) },
        },
        resolve: async (root, args, context, info) => {
          const { pageSize, page } = args;

          const items = await EntityModel.find({
            type: 'offers',
            locationSlug: args.locationSlug,
          })
            .skip(pageSize * (page - 1))
            .limit(pageSize)
            .exec();
          if (!items) {
            throw new Error('Error while fetching offers data.');
          }

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
          var restaurants = await EntityModel.find({ type: 'restaurant' })
            .select(projections)
            .or([
              { cuisine: { $regex: keyword, $options: 'i' } },
              { title: { $regex: keyword, $options: 'i' } },
            ])
            .skip(page * pageSize)
            .limit(pageSize)
            .exec();
          if (!restaurants) {
            throw new Error('Error while fetching all offers data.');
          }
          return restaurants;
        },
      },
      // Fetch all cuisine tags
      fetchCuisine: {
        type: new GraphQLList(tagType),
        args: {},
        resolve: async (root, args, context, info) => {
          const projections = getProjection(info);
          var tags = await EntityModel.find({ type: 'cuisine' }).exec();
          console.log(tags);
          if (!tags) {
            throw new Error('Error while fetching all offers data.');
          }
          return tags;
        },
      },
    };
  },
});
