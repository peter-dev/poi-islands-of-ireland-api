'use strict';
const Joi = require('@hapi/joi');

// joi region schema for swagger documentation
const SwaggerRegionSchema = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  identifier: Joi.string().required(),
  location: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required()
  }).label('Location').required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required()
}).label('Region');

// joi id param schema for api validation
const ApiRegionIdParamSchema = Joi.object({
  id: Joi.string()
    .alphanum()
    .max(24)
    .required()
    .description('the id of the region')
});

module.exports = {
  SwaggerRegionSchema,
  ApiRegionIdParamSchema
};
