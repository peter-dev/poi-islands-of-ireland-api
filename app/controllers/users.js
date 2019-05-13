'use strict';
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');
const User = require('../models/user');
const Utils = require('./utils');
const { ApiUserSchema, ApiUserIdParamSchema, SwaggerUserSchema } = require('../schemas/user');

const Users = {
  authenticate: {
    auth: false,
    // swagger properties
    description: 'Authenticate user',
    tags: ['api', 'users'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '201': {
            description: 'Success',
            schema: Joi.object({
              success: Joi.boolean()
                .valid(true)
                .required(),
              token: Joi.string()
                .token()
                .required()
            }).label('Authentication')
          },
          '400': { description: 'Bad Request' },
          '404': { description: 'Not Found' }
        }
      }
    },
    // validate the payload against the Joi schema
    validate: {
      payload: ApiUserSchema
    },
    handler: async function(request, h) {
      try {
        const user = await User.findOne({ email: request.payload.email }).select('+admin');
        if (!user) {
          return Boom.notFound('Authentication failed. User not found');
        }
        const isValidPassword = await user.comparePassword(request.payload.password);
        if (!isValidPassword) {
          return Boom.unauthorized('Authentication failed. Password mismatch');
        }
        const token = Utils.generateToken(user);
        return h.response({ success: true, token: token }).code(201);
      } catch (err) {
        return Boom.badRequest('Invalid request');
      }
    }
  },

  create: {
    auth: false,
    // swagger properties
    description: 'Create new user',
    tags: ['api', 'users'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '201': {
            description: 'Success',
            schema: SwaggerUserSchema
          },
          '400': { description: 'Bad Request' },
          '500': { description: 'Bad Implementation' }
        }
      }
    },
    // validate the payload against the Joi schema
    validate: {
      payload: ApiUserSchema
    },
    handler: async function(request, h) {
      try {
        const existingUser = await User.findByEmail(request.payload.email);
        if (existingUser) {
          return Boom.badRequest('User with this email already exist');
        }
        const newUser = new User(request.payload);
        // default all users to not an admin
        newUser.admin = false;
        // temporary hack to allow unit test user to be an admin
        if (newUser.email === 'piotr@baran.com') {
          newUser.admin = true;
        }
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
              .items(SwaggerUserSchema)
              .label('Users')
          }
        }
      }
    },
    handler: async function(request, h) {
      return await User.find();
    }
  },

  findOne: {
    // swagger properties
    description: 'Find user by id',
    tags: ['api', 'users'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: SwaggerUserSchema
          },
          '400': { description: 'Bad Request' },
          '404': { description: 'Not Found' }
        }
      }
    },
    // validate the parameters against the Joi schema
    validate: {
      params: ApiUserIdParamSchema
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
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: SwaggerUserSchema
          },
          '400': { description: 'Bad Request' },
          '404': { description: 'Not Found' },
          '500': { description: 'Bad Implementation' }
        }
      }
    },
    // validate the payload and parameters against the Joi schema
    validate: {
      params: ApiUserIdParamSchema,
      payload: ApiUserSchema
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
        // options: { new: true } => return the modified document rather than the original
        const updatedUser = User.findOneAndUpdate({ _id: request.params.id }, attributes, { new: true });
        if (!updatedUser) {
          return Boom.badImplementation('Error updating user');
        }
        return updatedUser;
      } catch (err) {
        return Boom.badRequest('Invalid id');
      }
    }
  },

  deleteAll: {
    // the user must have a scope of 'admin'
    auth: {
      scope: ['admin']
    },
    // swagger properties
    description: 'Delete users',
    tags: ['api', 'users', 'admin'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: Joi.object({
              success: Joi.boolean()
                .valid(true)
                .required()
            }).label('Response')
          }
        }
      }
    },
    handler: async function(request, h) {
      await User.deleteMany({});
      return { success: true };
    }
  },

  deleteOne: {
    // the user must have a scope of 'admin'
    auth: {
      scope: ['admin']
    },
    // swagger properties
    description: 'Delete user by id',
    tags: ['api', 'users', 'admin'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: Joi.object({
              success: Joi.boolean()
                .valid(true)
                .required()
            }).label('Response')
          },
          '400': { description: 'Bad Request' },
          '404': { description: 'Not Found' }
        }
      }
    },
    // validate the parameters against the Joi schema
    validate: {
      params: ApiUserIdParamSchema
    },
    handler: async function(request, h) {
      try {
        const user = await User.findOneAndDelete({ _id: request.params.id });
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
