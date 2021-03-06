const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('savedBooks');

        return userData;
      }

      throw new AuthenticationError('Not logged in');
    },
    // get a single user by either their id or their username
    getSingleUser: async (parent, args) => {
      const params = args.username ? { username: args.username } : { _id: args.id };

      const foundUser = await User.findOne(params).select('-__v -password');

      if (!foundUser) {
        throw new AuthenticationError('Cannot find a user with this id!');
      }

      return foundUser;
    }
  },

  Mutation: {
    // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
    createUser: async (parent, args) => {
      const user = await User.create(args);

      if (!user) {
        throw new AuthenticationError('Something is wrong!');
      }

      const token = signToken(user);

      return { token, user };
    },
    // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
    // {body} is destructured req.body
    login: async (parent, { username, email, password }) => {
      const params = username ? { username: username } : { email: email };

      const user = await User.findOne(params);

      if (!user) {
        throw new AuthenticationError("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Wrong password!');
      }

      const token = signToken(user);
      return { token, user };
    },
    // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
    // user comes from `req.user` created in the auth middleware function
    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { savedBooks: input } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError("Couldn't find user with this id!");
    },
    // remove a book from `savedBooks`
    deleteBook: async (parent, { bookId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { savedBooks: { bookId: bookId } } },
          { new: true }
        );
        return updatedUser;
      }
      throw new AuthenticationError("Couldn't find user with this id!");
    }
  }
};

module.exports = resolvers;