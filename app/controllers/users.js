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
  find: {
    description: 'Get users',
    tags: ['api', 'users'],
    // configure http status codes for the endpoint
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
    handler: async function(request, reply) {
      return await User.find();
    }
  },

  findOne: {
    description: 'Get user by id',
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
    validate: {
      params: {
        id: Joi.string()
          .required()
          .description('the id of the user')
      }
    },
    handler: async function(request, reply) {
      try {
        const user = await User.findOne({ _id: request.params.id });
        if (!user) {
          return Boom.notFound('No User with this id');
        }
        return user;
      } catch (err) {
        return Boom.badRequest('Invalid id');
      }
    }
  },

  create: {
    description: 'Add user',
    tags: ['api', 'users'],
    // configure http status codes for the endpoint
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
    handler: async function(request, reply) {
      const newUser = new User(request.payload);
      newUser.password = await User.hashPassword(request.payload.password);
      const user = await newUser.save();
      if (user) {
        return reply.response(user).code(201);
      }
      return Boom.badImplementation('Error creating user');
    }
  },

  deleteAll: {
    description: 'Delete users',
    tags: ['api', 'users'],
    // configure http status codes for the endpoint
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': { description: 'Success' }
        }
      }
    },
    handler: async function(request, reply) {
      await User.deleteMany({});
      return { success: true };
    }
  },

  deleteOne: {
    description: 'Delete user by id',
    tags: ['api', 'users'],
    // configure http status codes for the endpoint
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': { description: 'Success' },
          '400': { description: 'Bad Request' },
          '404': { description: 'Not Found' }
        }
      }
    },
    validate: {
      params: {
        id: Joi.string()
          .required()
          .description('the id of the user')
      }
    },
    handler: async function(request, reply) {
      try {
        const user = await User.deleteOne({ _id: request.params.id });
        if (user) {
          return { success: true };
        }
        return Boom.notFound('No User with this id');
      } catch (err) {
        return Boom.badRequest('Invalid id');
      }
    }
  }
};

module.exports = Users;
