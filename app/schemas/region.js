'use strict';
const Joi = require('joi');

// joi region schema for swagger documentation
const SwaggerRegionSchema = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().required(),
  identifier: Joi.string().required(),
  location: Joi.object({
    lat: Joi.number().precision(8).required(),
    lng: Joi.number().precision(8).required()
  })
    .label('Location')
    .required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required()
}).label('Region');

module.exports = {
  SwaggerRegionSchema
};
