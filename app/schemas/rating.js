'use strict';
const Joi = require('@hapi/joi');

// joi rating schema for swagger documentation
const SwaggerRatingSchema = Joi.object({
  _id: Joi.string().required(),
  score: Joi.number().required(),
  island: Joi.string().required(),
  user: Joi.string().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required()
}).label('Rating');

// joi rating schema for api validation
const ApiRatingSchema = Joi.object({
  score: Joi.number()
    .min(0)
    .max(5)
    .required(),
  island: Joi.string()
    .alphanum()
    .length(24)
    .required()
    .example('012345678901234567890123'),
  user: Joi.string()
    .alphanum()
    .length(24)
    .required()
    .example('012345678901234567890123')
}).label('New Rating');

// joi id param schema for api validation
const ApiRatingIdParamSchema = Joi.object({
  id: Joi.string()
    .alphanum()
    .max(24)
    .required()
    .description('the id of the rating')
});

module.exports = {
  SwaggerRatingSchema,
  ApiRatingSchema,
  ApiRatingIdParamSchema
};
