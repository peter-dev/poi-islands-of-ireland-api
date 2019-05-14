'use strict';
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');
const User = require('../models/user');
const Island = require('../models/island');
const Rating = require('../models/rating');
const { ApiRatingSchema, ApiRatingIdParamSchema, SwaggerRatingSchema } = require('../schemas/rating');
const { ApiIslandIdParamSchema } = require('../schemas/island');
const { ApiUserIdParamSchema } = require('../schemas/user');



const Ratings = {
  create: {
    // swagger properties
    description: 'Create new rating',
    tags: ['api', 'ratings'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '201': {
            description: 'Success',
            schema: SwaggerRatingSchema
          },
          '400': { description: 'Bad Request' },
          '404': { description: 'Not Found' },
          '500': { description: 'Bad Implementation' }
        }
      }
    },
    // validate the payload against the Joi schema
    validate: {
      payload: ApiRatingSchema
    },
    handler: async function(request, h) {
      try {
        const user = await User.findById(request.payload.user);
        if (!user) {
          return Boom.notFound('No User with this id');
        }
        const island = await Island.findById(request.payload.island);
        if (!island) {
          return Boom.notFound('No Island with this id');
        }
        const existingRating = await Rating.findOne({island: island._id, user: user._id});
        if (existingRating) {
          return Boom.badRequest('Rating with this user for this island already exist');
        }
        const newRating = new Rating(request.payload);
        const rating = await newRating.save();
        if (!rating) {
          return Boom.badImplementation('Error creating rating');
        }
        return h.response(rating).code(201);
      } catch (err) {
        return Boom.badRequest('Invalid request');
      }
    }
  },

  findOne: {
    // swagger properties
    description: 'Find rating by id',
    tags: ['api', 'ratings'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: SwaggerRatingSchema
          },
          '400': { description: 'Bad Request' },
          '404': { description: 'Not Found' }
        }
      }
    },
    // validate the parameters against the Joi schema
    validate: {
      params: ApiRatingIdParamSchema
    },
    handler: async function(request, h) {
      try {
        const rating = await Rating.findById(request.params.id);
        if (!rating) {
          return Boom.notFound('No Rating with this id');
        }
        return rating;
      } catch (err) {
        return Boom.badRequest('Invalid id');
      }
    }
  },

  findByIsland: {
    // swagger properties
    description: 'Find all ratings by island id',
    tags: ['api', 'ratings'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: Joi.array()
              .items(SwaggerRatingSchema)
              .label('Ratings')
          },
          '400': { description: 'Bad Request' },
          '404': { description: 'Not Found' }
        }
      }
    },
    // validate the parameters against the Joi schema
    validate: {
      params: ApiIslandIdParamSchema
    },
    handler: async function(request, h) {
      try {
        const island = await Island.findById(request.params.id);
        if (!island) {
          return Boom.notFound('No Island with this id');
        }
        return await Rating.find({ island: request.params.id });
      } catch (err) {
        return Boom.badRequest('Invalid id');
      }
    }
  },

  findByUser: {
    // swagger properties
    description: 'Find all ratings by user id',
    tags: ['api', 'ratings'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: Joi.array()
              .items(SwaggerRatingSchema)
              .label('Ratings')
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
        return await Rating.find({ user: request.params.id });
      } catch (err) {
        return Boom.badRequest('Invalid id');
      }
    }
  },

  update: {
    // swagger properties
    description: 'Update rating by id',
    tags: ['api', 'ratings'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: SwaggerRatingSchema
          },
          '400': { description: 'Bad Request' },
          '404': { description: 'Not Found' },
          '500': { description: 'Bad Implementation' }
        }
      }
    },
    // validate the payload and parameters against the Joi schema
    validate: {
      params: ApiRatingIdParamSchema,
      payload: ApiRatingSchema
    },
    handler: async function(request, h) {
      try {
        const rating = await Rating.findById(request.params.id);
        if (!rating) {
          return Boom.notFound('No Rating with this id');
        }
        const user = await User.findById(request.payload.user);
        if (!user) {
          return Boom.notFound('No User with this id');
        }
        const island = await Island.findById(request.payload.island);
        if (!island) {
          return Boom.notFound('No Island with this id');
        }
        // es6 syntax
        const { score } = request.payload;
        const attributes = {
          score: score
        };
        // options: { new: true } => return the modified document rather than the original
        const updatedRating = await Rating.findOneAndUpdate({ _id: request.params.id }, attributes, { new: true });
        if (!updatedRating) {
          return Boom.badImplementation('Error updating rating');
        }
        return updatedRating;
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
    description: 'Delete ratings',
    tags: ['api', 'ratings', 'admin'],
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
      await Rating.deleteMany({});
      return { success: true };
    }
  },

  deleteOne: {
    // the user must have a scope of 'admin'
    auth: {
      scope: ['admin']
    },
    // swagger properties
    description: 'Delete rating by id',
    tags: ['api', 'ratings', 'admin'],
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
      params: ApiRatingIdParamSchema
    },
    handler: async function(request, h) {
      try {
        const rating = await Rating.findOneAndDelete({ _id: request.params.id });
        if (!rating) {
          return Boom.notFound('No Rating with this id');
        }
        return { success: true };
      } catch (err) {
        return Boom.badRequest('Invalid id');
      }
    }
  },

  deleteByIsland: {
    // the user must have a scope of 'admin'
    auth: {
      scope: ['admin']
    },
    // swagger properties
    description: 'Delete ratings by island id',
    tags: ['api', 'ratings', 'admin'],
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
      params: ApiIslandIdParamSchema
    },
    handler: async function(request, h) {
      try {
        const island = await Island.findById(request.params.id);
        if (!island) {
          return Boom.notFound('No Island with this id');
        }
        await Rating.deleteMany({ island: request.params.id });
        return { success: true };
      } catch (err) {
        return Boom.badRequest('Invalid id');
      }
    }
  },

  deleteByUser: {
    // the user must have a scope of 'admin'
    auth: {
      scope: ['admin']
    },
    // swagger properties
    description: 'Delete ratings by user id',
    tags: ['api', 'ratings', 'admin'],
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
        const user = await User.findById(request.params.id);
        if (!user) {
          return Boom.notFound('No User with this id');
        }
        await Rating.deleteMany({ user: request.params.id });
        return { success: true };
      } catch (err) {
        return Boom.badRequest('Invalid id');
      }
    }
  }
};

module.exports = Ratings;
