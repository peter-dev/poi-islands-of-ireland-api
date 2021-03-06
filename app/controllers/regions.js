'use strict';
const Boom = require('@hapi/boom');
const Joi = require('@hapi/joi');
const Region = require('../models/region');
const { SwaggerRegionSchema, ApiRegionIdParamSchema } = require('../schemas/region');

const Regions = {
  findAll: {
    // swagger properties
    description: 'Find all regions',
    tags: ['api', 'regions'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: Joi.array()
              .items(SwaggerRegionSchema)
              .label('Regions')
          }
        }
      }
    },
    handler: async function(request, h) {
      return await Region.find();
    }
  },

  findOne: {
    // swagger properties
    description: 'Find region by id',
    tags: ['api', 'regions'],
    plugins: {
      'hapi-swagger': {
        responses: {
          '200': {
            description: 'Success',
            schema: SwaggerRegionSchema
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
        return region;
      } catch (err) {
        return Boom.badRequest('Invalid id');
      }
    }
  }
};

module.exports = Regions;
