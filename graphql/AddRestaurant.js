var GraphQLNonNull = require('graphql').GraphQLNonNull;
var GraphQLString = require('graphql').GraphQLString;
var restaurantType = require('./RestaurantType');
var restaurantModel = require('./Restaurant');
exports.addRestaurant = {
  type: restaurantType.restaurantType,

  args: {
    slug: {
        type: new GraphQLNonNull(GraphQLString)
    }
  },
  resolve: async(root, args)=> {
    //under the resolve method we get our arguments
    const uModel = new restaurantModel(args);
    const newRestaurant = await uModel.save();
    if (!newRestaurant) {
      throw new Error('error');
    }
    return newRestaurant
  }
}