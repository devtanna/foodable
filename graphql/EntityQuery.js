var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLList = require('graphql').GraphQLList;
var GraphQLString = require('graphql').GraphQLString;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLInt = require('graphql').GraphQLInt;
var EntityModel = require('./Entity');
var entityType = require('./EntityType').entityType;
var arrayLocationType = require('./EntityType').arrayLocationType;

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
          const items = await EntityModel.aggregate([
            { $match: { type: 'offers', locationSlug: args.locationSlug } },
            { $unwind: '$offers' },
            // { $sort: { 'added': 1 } },
            {
              $project: {
                added: 0,
              },
            },
            {
              $group: {
                _id: { slug: '$slug' },
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
            throw new Error('Error while fetching offers data.');
          }
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
    };
  },
});
