'use strict';
const Joi = require('joi');

// joi user schema for swagger documentation
const SwaggerUserSchema = Joi.object({
  _id: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date().required()
}).label('User');

// joi user schema for api validation
const ApiUserSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string().required()
});

// joi id param schema for api validation
const ApiUserIdParamSchema = Joi.object({
  id: Joi.string()
    .required()
    .description('the id of the user')
});

module.exports = {
  SwaggerUserSchema,
  ApiUserSchema,
  ApiUserIdParamSchema
};
