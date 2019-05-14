'use strict';
const Joi = require('@hapi/joi');

// joi island schema for swagger documentation
const SwaggerIslandSchema = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  location: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required()
  }).label('Location').required(),
  region: Joi.string().required(),
  createdBy: Joi.string().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required()
}).label('Island');

// joi island schema for api validation
const ApiIslandSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(30)
    .required(),
  description: Joi.string().trim().required(),
  location: Joi.object({
    lat: Joi.number()
      .precision(8)
      .required(),
    lng: Joi.number()
      .precision(8)
      .required()
  }).required(),
  createdBy: Joi.string()
    .alphanum()
    .length(24)
    .required()
    .example('012345678901234567890123')
}).label('New Island');

// joi id param schema for api validation
const ApiRegionIslandIdParamSchema = Joi.object({
  region_id: Joi.string()
    .alphanum()
    .max(24)
    .required()
    .description('the id of the region'),
  island_id: Joi.string()
    .alphanum()
    .max(24)
    .required()
    .description('the id of the island')
});

// joi id param schema for api validation
const ApiIslandIdParamSchema = Joi.object({
  id: Joi.string()
    .alphanum()
    .max(24)
    .required()
    .description('the id of the island')
});

module.exports = {
  SwaggerIslandSchema,
  ApiIslandSchema,
  ApiRegionIslandIdParamSchema,
  ApiIslandIdParamSchema
};
