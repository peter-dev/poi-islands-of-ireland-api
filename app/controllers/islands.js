'use strict';
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');
const Region = require('../models/region');
const Island = require('../models/island');
const { ApiIslandSchema, ApiRegionIslandIdParamSchema, SwaggerIslandSchema } = require('../schemas/island');
const { ApiRegionIdParamSchema } = require('../schemas/region');

const Islands = {
  create: {
    // swagger properties
    description: 'Create new island',
    tags: ['api', 'islands'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '201': {
            description: 'Success',
            schema: SwaggerIslandSchema
          },
          '400': { description: 'Bad Request' },
          '404': { description: 'Not Found' },
          '500': { description: 'Bad Implementation' }
        }
      }
    },
    // validate the payload and parameters against the Joi schema
    validate: {
      params: ApiRegionIdParamSchema,
      payload: ApiIslandSchema
    },
    handler: async function(request, h) {
      try {
        const region = await Region.findById(request.params.id);
        if (!region) {
          return Boom.notFound('No Region with this id');
        }
        const newIsland = new Island(request.payload);
        newIsland.region = region._id;
        const island = await newIsland.save();
        if (!island) {
          return Boom.badImplementation('Error creating island');
        }
        return h.response(island).code(201);
      } catch (err) {
        return Boom.badRequest('Invalid id');
      }
    }
  },

  findAll: {
    // swagger properties
    description: 'Find all islands',
    tags: ['api', 'islands'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: Joi.array()
              .items(SwaggerIslandSchema)
              .label('Islands')
          }
        }
      }
    },
    handler: async function(request, h) {
      return await Island.find();
    }
  },

  findByRegion: {
    // swagger properties
    description: 'Find all islands by region id',
    tags: ['api', 'islands'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: Joi.array()
              .items(SwaggerIslandSchema)
              .label('Islands')
          },
          '400': { description: 'Bad Request' },
          '404': { description: 'Not Found' }
        }
      }
    },
    // validate the parameters against the Joi schema
    validate: {
      params: ApiRegionIdParamSchema
    },
    handler: async function(request, h) {
      try {
        const region = await Region.findById(request.params.id);
        if (!region) {
          return Boom.notFound('No Region with this id');
        }
        return await Island.find({ region: request.params.id });
      } catch (err) {
        return Boom.badRequest('Invalid id');
      }
    }
  },

  update: {
    // swagger properties
    description: 'Update island by id',
    tags: ['api', 'islands'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: SwaggerIslandSchema
          },
          '400': { description: 'Bad Request' },
          '404': { description: 'Not Found' },
          '500': { description: 'Bad Implementation' }
        }
      }
    },
    // validate the payload and parameters against the Joi schema
    validate: {
      params: ApiRegionIslandIdParamSchema,
      payload: ApiIslandSchema
    },
    handler: async function(request, h) {
      try {
        const region = await Region.findById(request.params.region_id);
        if (!region) {
          return Boom.notFound('No Region with this id');
        }
        const island = await Island.findById(request.params.island_id);
        if (!island) {
          return Boom.notFound('No Island with this id');
        }
        // es6 syntax
        const { name, description, location } = request.payload;
        const attributes = {
          name: name,
          description: description,
          location: location
        };
        // options: { new: true } => return the modified document rather than the original
        const updatedIsland = await Island.findOneAndUpdate({ _id: request.params.island_id }, attributes, { new: true });
        if (!updatedIsland) {
          return Boom.badImplementation('Error updating island');
        }
        return updatedIsland;
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
    description: 'Delete islands',
    tags: ['api', 'islands', 'admin'],
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
      await Island.deleteMany({});
      return { success: true };
    }
  },

  deleteByRegion: {
    // the user must have a scope of 'admin'
    auth: {
      scope: ['admin']
    },
    // swagger properties
    description: 'Delete islands by region id',
    tags: ['api', 'islands', 'admin'],
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
      params: ApiRegionIdParamSchema
    },
    handler: async function(request, h) {
      try {
        const region = await Region.findById(request.params.id);
        if (!region) {
          return Boom.notFound('No Region with this id');
        }
        await Island.deleteMany({ region: request.params.id });
        return { success: true };
      } catch (err) {
        return Boom.badRequest('Invalid id');
      }
    }
  }
};

module.exports = Islands;
