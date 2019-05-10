'use strict';
const Boom = require('boom');
const Joi = require('joi');
const Region = require('../models/region');
const SwaggerRegionSchema = require('../schemas/region').SwaggerRegionSchema;

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
  }
};

module.exports = Regions;
