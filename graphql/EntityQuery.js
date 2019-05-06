var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLList = require('graphql').GraphQLList;
var GraphQLString = require('graphql').GraphQLString;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLInt = require('graphql').GraphQLInt;
//import restaurant model 
var EntityModel = require('./Entity');
//import GraphQL RestaurantType
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
        entity: {
          type: new GraphQLList(entityType),
          args: {
              type: { type: GraphQLNonNull(GraphQLString) },
              locationSlug: { type: GraphQLString },
              pageSize: { type: GraphQLInt },
              page: { type: GraphQLInt }
          },
          resolve: async (root, args, context, info) => {
              const { pageSize, page } = args;
              const projections = getProjection(info);
              const items = await EntityModel.find({'type': args.type, 'locationSlug': args.locationSlug}).select(projections).skip(page*pageSize)
              .limit(pageSize)
              .exec();
              return items;
          }
        }
    }
  }
});

