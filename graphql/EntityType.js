var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLID = require('graphql').GraphQLID;
var GraphQLString = require('graphql').GraphQLString;
var GraphQLList = require('graphql').GraphQLList;

// OFFER
// const offerObjectType = new GraphQLObjectType({
//     name: 'offer',
//     fields: {
//         title: {
//             type: new GraphQLNonNull(GraphQLString)
//         },     
//         href: {
//             type: new GraphQLNonNull(GraphQLString)
//         },
//         image: {
//             type: GraphQLString
//         },
//         location: {
//             type: GraphQLString
//         },
//         address: {
//             type: GraphQLString
//         },
//         cuisine: {
//             type: GraphQLString
//         },
//         offer: {
//             type: new GraphQLNonNull(GraphQLString)
//         },
//         rating: {
//             type: GraphQLString
//         },
//         votes: {
//             type: GraphQLString
//         },
//         cost_for_two: {
//             type: GraphQLString
//         },
//         slug: {
//             type: GraphQLString
//         },
//         source: {
//             type: new GraphQLNonNull(GraphQLString)
//         }
//     }
// });

// RESTAURANT
exports.entityType = new GraphQLObjectType({
    name: 'entity',
    fields: () =>{
        return {     
            title: {
                type: GraphQLString
            },   
            type: {
                type: GraphQLString
            },     
            href: {
                type: GraphQLString
            },
            image: {
                type: GraphQLString
            },
            location: {
                type: GraphQLString
            },
            address: {
                type: GraphQLString
            },
            cuisine: {
                type: GraphQLString
            },
            offer: {
                type: GraphQLString
            },
            rating: {
                type: GraphQLString
            },
            votes: {
                type: GraphQLString
            },
            cost_for_two: {
                type: GraphQLString
            },
            slug: {
                type: GraphQLString
            },
            source: {
                type: GraphQLString
            },
            locationSlug: {
                type: GraphQLString
            },
            locationName: {
                type: GraphQLString
            },
            _id: {
                type: GraphQLString
            },
        }
    }
});