var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLList = require('graphql').GraphQLList;
var GraphQLString = require('graphql').GraphQLString;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLInt = require('graphql').GraphQLInt;
var EntityModel = require('./Entity');
var entityType = require('./EntityType').entityType;

function getProjection (fieldASTs) {
    return fieldASTs.fieldNodes[0].selectionSet.selections.reduce((projections, selection) => {
        projections[selection.name.value] = 1;
        return projections;
    }, {});
};

// Query
exports.EntityQuery = new GraphQLObjectType({
  name: 'Query',
  fields:  ()=> {
    return {
        entities: {
          type: new GraphQLList(entityType),
          args: {
              pageSize: { type: GraphQLInt },
              page: { type: GraphQLInt }
            },
          resolve:  async (root, args, context, info)=> {
              const { pageSize, page } = args;
              const projections = getProjection(info);
              const items = await EntityModel.find().select(projections).skip(page*pageSize)
              .limit(pageSize)
              .exec();
              if (!items) {
                  throw new Error('Error while fetching all data.')
              }
              return items
          }
        },
        locations: {
            type: new GraphQLList(entityType),
            args: {
                pageSize: { type: GraphQLInt },
                page: { type: GraphQLInt }
              },
            resolve:  async (root, args, context, info)=> {
                const { pageSize, page } = args;
                const projections = getProjection(info);
                const items = await EntityModel.find({'type':'location'}).select(projections).skip(page*pageSize)
                .limit(pageSize)
                .exec();
                if (!items) {
                    throw new Error('Error while fetching location data.')
                }
                return items
            }
        },
        offers: {
            type: new GraphQLList(entityType),
            args: {
                pageSize: { type: GraphQLInt },
                page: { type: GraphQLInt },
                locationSlug: { type: GraphQLString },
              },
            resolve:  async (root, args, context, info)=> {
                const { pageSize, page } = args;
                const projections = getProjection(info);
                const items = await EntityModel.aggregate([
                    {$match:{'type':'offers', 'locationSlug': args.locationSlug}},
                    {$unwind: "$offers"},
                    {$sort: {"offers.score":-1}},
                    {$group: {_id:"$_id", offers: {$push:"$offers"}}}
                    ]).skip(page*pageSize)
                    .limit(pageSize)
                    .exec();
                if (!items) {
                    throw new Error('Error while fetching location data.')
                }
                return items
            }
        }
    }
  }
});

