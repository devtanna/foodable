var GraphQLSchema = require('graphql').GraphQLSchema;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var query = require('./EntityQuery').EntityQuery;
// var queryFindByKeyword = require('./RestaurantQuery').RestaurantQueryFindByKeyword;
// var mutation = require('./RestaurantMutations');

exports.EntitySchema = new GraphQLSchema({
    query: query
    // mutation: new GraphQLObjectType({
    //     name: 'Mutation',
    //     fields: mutation
    // })
})

// exports.RestaurantSearchSchema = new GraphQLSchema({
//     query: queryFindByKeyword
// })