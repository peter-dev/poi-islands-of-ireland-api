'use strict';
// import .env
require('dotenv').config();
const Jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.generateToken = function(user) {
  // check if the user object passed in has admin set to true
  let scopes;
  if (user.admin) {
    scopes = 'admin';
  }
  // sign the JWT
  return Jwt.sign({ id: user._id, email: user.email, scope: scopes }, process.env.jwt_secret, {
    algorithm: 'HS256',
    expiresIn: '1h'
  });
};

exports.validate = async function(decoded, request) {
  const user = await User.findOne({ _id: decoded.id });
  if (!user) {
    return { isValid: false };
  } else {
    return { isValid: true };
  }
};
