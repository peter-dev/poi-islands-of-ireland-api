'use strict';
const Boom = require('boom');
const Joi = require('joi');
const User = require('../models/user');

// joi user schema for swagger documentation
const userModel = Joi.object({
  _id: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required()
}).label('User');

const Users = {
  create: {
    // swagger properties
    description: 'Create new user',
    tags: ['api', 'users'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '201': {
            description: 'Success',
            schema: userModel
          },
          '400': { description: 'Bad Request' },
          '500': { description: 'Bad Implementation' }
        }
      }
    },
    // joi properties
    validate: {
      payload: {
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string()
          .email()
          .required(),
        password: Joi.string().required()
      }
    },
    handler: async function(request, h) {
      try {
        const newUser = new User(request.payload);
        newUser.password = await User.hashPassword(request.payload.password);
        const user = await newUser.save();
        if (!user) {
          return Boom.badImplementation('Error creating user');
        }
        return h.response(user).code(201);
      } catch (err) {
        return Boom.badRequest('Invalid request');
      }
    }
  },

  findAll: {
    // swagger properties
    description: 'Find all users',
    tags: ['api', 'users'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: Joi.array()
              .items(userModel)
              .label('Users')
          }
        }
      }
    },
    handler: async function(request, h) {
      return await User.find({});
    }
  },

  findOne: {
    // swagger properties
    description: 'Find user by id',
    tags: ['api', 'users'],
    // configure http status codes for the endpoint
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: userModel
          },
          '400': { description: 'Bad Request' },
          '404': { description: 'Not Found' }
        }
      }
    },
    // joi properties
    validate: {
      params: {
        id: Joi.string()
          .required()
          .description('the id of the user')
      }
    },
    handler: async function(request, h) {
      try {
        const user = await User.findById(request.params.id);
        if (!user) {
          return Boom.notFound('No User with this id');
        }
        return user;
      } catch (err) {
        return Boom.badRequest('Invalid id');
      }
    }
  },

  update: {
    // swagger properties
    description: 'Update user by id',
    tags: ['api', 'users'],
    // configure http status codes for the endpoint
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: userModel
          },
          '400': { description: 'Bad Request' },
          '404': { description: 'Not Found' },
          '500': { description: 'Bad Implementation' }
        }
      }
    },
    // joi properties
    validate: {
      params: {
        id: Joi.string()
          .required()
          .description('the id of the user')
      },
      payload: {
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string()
          .email()
          .required(),
        password: Joi.string().required()
      }
    },
    handler: async function(request, h) {
      try {
        const user = await User.findById(request.params.id);
        if (!user) {
          return Boom.notFound('No User with this id');
        }
        // es6 syntax
        const { firstName, lastName, email, password } = request.payload;
        const attributes = {
          firstName: firstName,
          lastName: lastName,
          email: email,
          password: password
        };
        attributes.password = await User.hashPassword(password);
        // options: { new: true } return the modified document rather than the original
        const updatedUser = User.findByIdAndUpdate(request.params.id, attributes, { new: true });
        if (!updatedUser) {
          return Boom.badImplementation('Error updating user');
        }
        return updatedUser;
      } catch (err) {
        return Boom.badRequest('Invalid request');
      }
    }
  },

  deleteAll: {
    // swagger properties
    description: 'Delete users',
    tags: ['api', 'users'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': { description: 'Success' }
        }
      }
    },
    handler: async function(request, h) {
      await User.deleteMany({});
      return { success: true };
    }
  },

  deleteOne: {
    // swagger properties
    description: 'Delete user by id',
    tags: ['api', 'users'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': { description: 'Success' },
          '400': { description: 'Bad Request' },
          '404': { description: 'Not Found' }
        }
      }
    },
    // joi properties
    validate: {
      params: {
        id: Joi.string()
          .required()
          .description('the id of the user')
      }
    },
    handler: async function(request, h) {
      try {
        const user = await User.findByIdAndDelete(request.params.id);
        if (!user) {
          return Boom.notFound('No User with this id');
        }
        return { success: true };
      } catch (err) {
        return Boom.badRequest('Invalid id');
      }
    }
  }
};

module.exports = Users;
