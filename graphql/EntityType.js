var GraphQLObjectType = require('graphql').GraphQLObjectType;
var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLID = require('graphql').GraphQLID;
var GraphQLString = require('graphql').GraphQLString;
var GraphQLFloat = require('graphql').GraphQLFloat;
var GraphQLList = require('graphql').GraphQLList;

//OFFER
const offerObjectType = new GraphQLObjectType({
  name: 'offer',
  fields: {
    title: {
      type: GraphQLString,
    },
    added: {
      type: GraphQLFloat,
    },
    type: {
      type: GraphQLString,
    },
    href: {
      type: GraphQLString,
    },
    score: {
      type: GraphQLFloat,
    },
    image: {
      type: GraphQLString,
    },
    location: {
      type: GraphQLString,
    },
    address: {
      type: GraphQLString,
    },
    cuisine: {
      type: GraphQLString,
    },
    offer: {
      type: GraphQLString,
    },
    rating: {
      type: GraphQLString,
    },
    votes: {
      type: GraphQLString,
    },
    cost_for_two: {
      type: GraphQLString,
    },
    slug: {
      type: GraphQLString,
    },
    source: {
      type: GraphQLString,
    },
    locationSlug: {
      type: GraphQLString,
    },
    locationName: {
      type: GraphQLString,
    },
    _id: {
      type: GraphQLString,
    },
  },
});

exports.arrayLocationType = new GraphQLObjectType({
  name: 'arrayLocationType',
  fields: () => {
    return {
      location: {
        type: GraphQLString,
      },
    };
  },
});

exports.entityType = new GraphQLObjectType({
  name: 'entity',
  fields: () => {
    return {
      title: {
        type: GraphQLString,
      },
      added: {
        type: GraphQLFloat,
      },
      type: {
        type: GraphQLString,
      },
      href: {
        type: GraphQLString,
      },
      score: {
        type: GraphQLFloat,
      },
      image: {
        type: GraphQLString,
      },
      location: {
        type: GraphQLString,
      },
      address: {
        type: GraphQLString,
      },
      cuisine: {
        type: GraphQLString,
      },
      offer: {
        type: GraphQLString,
      },
      rating: {
        type: GraphQLString,
      },
      votes: {
        type: GraphQLString,
      },
      cost_for_two: {
        type: GraphQLString,
      },
      slug: {
        type: GraphQLString,
      },
      source: {
        type: GraphQLString,
      },
      locationSlug: {
        type: GraphQLString,
      },
      locationName: {
        type: GraphQLString,
      },
      _id: {
        type: GraphQLString,
      },
      offers: {
        type: GraphQLList(offerObjectType),
      },
    };
  },
});
