const { User, Book } = require('../models');
const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { param } = require('../routes');

const resolvers = {

    Query: {

        //get a user by username
        me: async (parent, args, context) => {
            if (context.user) {
              const userData = await User.findById(context.user._id);
      
              return userData;
            }
      
            throw new AuthenticationError("User not not logged in");
          },
        },
    Mutation: {

        addUser: async (parent, args) => {
            // create a new user
            const user = await User.create(args);
            // signToken with secret password
            const token = signToken(user);
      
            // Send token to client
            return { token, user };
          },

          //login details
          login: async (parent, { email, password }) => {
            // Check if user with given email exists
            const user = await User.findOne({ email });
      
            // If not found email throw error
            if (!user) {
              throw new AuthenticationError("Incorrect Credentials");
            }
      
            // Check if given password is the same as the un-hashed one in the database
            const correctPw = await user.isCorrectPassword(password);
      
            // If not, throw error
            if (!correctPw) {
              throw new AuthenticationError("Incorrect Credentials");
            }
      
            // Sign token and return it to the client
            const token = signToken(user);
            return { token, user };
          },

          //to save books
          saveBook: async (parent, { input }, { user }) => {
            if (user) {
              const saveBookData = User.findByIdAndUpdate(
                user._id,
                { $push: { savedBooks: input } },
                { new: true, runValidators: true }
              );
      
              return saveBookData;
            }
      
            throw new AuthenticationError("Login to save book, book cannot be saved in list");
          },



          removeBook: async (parent, { bookId }, { user }) => {
            if (user) {
              const userData = User.findByIdAndUpdate(
                user._id,
                { $pull: { savedBooks: { bookId } } },
                { new: true, runValidators: true }
              );
      
              return userData;
            }
      
            throw new AuthenticationError( "Cannot delete/remove book, you need to log in");
         },
     },
 };

module.exports = resolvers;