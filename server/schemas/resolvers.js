const { AuthenticationError } = require('apollo-server-express');
const { Book, User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parernt, args, context) => {

    },

    getSingleUser: async (parent, args) => {
      const params = args.username ? { username: args.username } : { _id: args.id };

      const foundUser = await User.findOne(params);

      if (!foundUser) {
        throw new AuthenticationError('Cannot find a user with this id!');
      }

      return foundUser;
    }

  },

  Mutation: {

  }
};

module.exports = resolvers;