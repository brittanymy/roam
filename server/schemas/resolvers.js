const { AuthenticationError } = require('apollo-server-express');
const { User, Trip } = require('../models');
const { signToken } = require('../utils/auth');
const mongoose = require('mongoose');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('-__v -password')
          .populate('trips')
          .populate('friends');

        return userData;
      }

      throw new AuthenticationError('Not logged in');
    },
    users: async () => {
      return User.find()
        .select('-__v -password')
        .populate('trips')
        .populate('friends');
    },
    user: async (parent, { username }) => {
      return User.findOne({ username })
        .select('-__v -password')
        .populate('trips')
        .populate('friends');
    },
    trip: async (parent, { _id }) => {
      return Trip.findOne({ _id })
        .populate('members');
    },
    trips: async (parent, { username }) => {
      const params = username ? { username } : {};
      return Trip.find(params).sort({ createdAt: -1 })
        .populate('members');
    },
    my_trips: async (parent, args, context) => {
      if (context.user) {
        const userData = await User.findOne({ _id: context.user._id })
          .select('trips')
          .populate('trips');
        
        return userData;
      }

      throw new AuthenticationError('Not logged in');
    }
  },

  Mutation: {
    addUser: async (parent, args) => {
      const user = await User.create(args);
      const token = signToken(user);

      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      const token = signToken(user);
      return { token, user };
    },
    addFriend: async (parent, { friendId }, context) => {
      if (context.user) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: context.user._id },
          { $addToSet: { friends: friendId } },
          { new: true }
        ).populate('friends');

        return updatedUser;
      }

      throw new AuthenticationError('You need to be logged in');
    },
    addTrip: async (parent, args, context) => {
      if (context.user) {
        // create trip
        const trip = await Trip.create({...args, creator: context.user.username, members: [context.user.email, ...args.members] });

        if (trip) {
          // add trip to each members trip array
          args.members.forEach(async member => {
            return await User.findOneAndUpdate(
              { email: member },
              { $push: { trips: trip } }
            );
          })
        }

        return trip;
      }

      throw new AuthenticationError('You need to be logged in');
    },
    deleteTrip: async (parent, { _id }, context) => {
      if (context.user) {
        const trip = await Trip.findOne( { _id } )
          .populate('members')

        trip.members.forEach(async member => {
          await User.findOneAndUpdate(
            { email: member },
            { $pull: { trips: mongoose.Types.ObjectId(_id) } }
          );
        });

        return await Trip.findOneAndDelete( { _id } );
      }

      throw new AuthenticationError('You need to be logged in');
    },
    updateTrip: async (parent, args, context) => {
      if (context.user) {
        const _id = args._id;
        let trip;

        // check if members need to be updated
        if (args.members[0]) {
          trip = await Trip.findByIdAndUpdate(
            { _id },
            { $set:
              {
                // spread and short circuit operators to conditionally update elements
                ...args.location && {location: args.location},
                ...args.dates && {dates: args.dates},
                ...args.transportation && {transportation: args.transportation},
                ...args.budget && {budget: args.budget}
              },
              $addToSet: { members: { $each: args.members } }
            },
            { new: true }
          );
        } else {
          trip = await Trip.findByIdAndUpdate(
            { _id },
            { $set:
              {
                ...args.location && {location: args.location},
                ...args.dates && {dates: args.dates},
                ...args.transportation && {transportation: args.transportation},
                ...args.budget && {budget: args.budget}
              }
            },
            { new: true }
          );
        }

        return trip;
      }

      throw new AuthenticationError('You need to be logged in');
    }
  }
};

module.exports = resolvers;
