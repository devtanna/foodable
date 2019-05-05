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
            // const projections = getProjection(info);
            const items = await EntityModel.find().skip(page*pageSize)
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
        resolve: (root, args, context, info) => {
            const { pageSize, page } = args;
            return EntityModel.find({'type': args.type, 'locationSlug': args.locationSlug}).skip(page*pageSize)
            .limit(pageSize)
            .exec();
        }
      }




    }
  }
});

// exports.RestaurantQueryFindByKeyword = new GraphQLObjectType({
//     name: 'QueryFindByKeyword',
//     fields:  ()=> {
//       return {
//         restaurants: {
//           type: new GraphQLList(restaurantType),
//           args: {
//             keyword: { type: GraphQLString },
//             pageSize: { type: GraphQLInt },
//             page: { type: GraphQLInt }
//           },
//           resolve: async (root, args, context, info) => {
//             const { keyword, pageSize, page } = args;
//             const projections = getProjection(info);
//             var restaurants = await RestaurantModel.find().select(projections).or(
//                 [
//                     {'slug': {'$regex': keyword, '$options': 'i'}}, 
//                     {'cuisine': {'$regex': keyword, '$options': 'i'}},
//                     {'title': {'$regex': keyword, '$options': 'i'}},
//                     {'locationSlug': {'$regex': keyword, '$options': 'i'}}
//                 ]
//             ).skip(page*pageSize)
//             .limit(pageSize)
//             .exec();
//             if (!restaurants) {
//                 throw new Error('Error while fetching data by keyword.')
//             }
//             return restaurants
//           }
//         }
//       }
//     }
// });
