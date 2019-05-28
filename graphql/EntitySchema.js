var GraphQLSchema = require('graphql').GraphQLSchema;
var GraphQLObjectType = require('graphql').GraphQLObjectType;
var query = require('./EntityQuery').EntityQuery;

exports.EntitySchema = new GraphQLSchema({
  query: query,
});
