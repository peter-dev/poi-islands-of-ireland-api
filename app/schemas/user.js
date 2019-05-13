'use strict';
const Joi = require('@hapi/joi');

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
  firstName: Joi.string()
    .min(2)
    .max(30)
    .required(),
  lastName: Joi.string()
    .min(2)
    .max(30)
    .required(),
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .min(2)
    .max(30)
    .required()
}).label('New User');

// joi id param schema for api validation
const ApiUserIdParamSchema = Joi.object({
  id: Joi.string()
    .alphanum()
    .max(24)
    .required()
    .description('the id of the user')
});

module.exports = {
  SwaggerUserSchema,
  ApiUserSchema,
  ApiUserIdParamSchema
};
