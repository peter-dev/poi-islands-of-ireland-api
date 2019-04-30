// import .env
require('dotenv').config();
const Jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.generateToken = function(user) {
  return Jwt.sign({ id: user._id, email: user.email }, process.env.jwt_secret, {
    algorithm: 'HS256',
    expiresIn: '1h'
  });
};

exports.decodeToken = function(token) {
  let userInfo = {};
  try {
    let decoded = Jwt.verify(token, process.env.jwt_secret);
    userInfo.userId = decoded.id;
    userInfo.email = decoded.email;
  } catch (e) {}

  return userInfo;
};

exports.validate = async function(decoded, request) {
  const user = await User.findOne({ _id: decoded.id });
  if (!user) {
    return { isValid: false };
  } else {
    return { isValid: true };
  }
};

exports.getUserIdFromRequest = function(request) {
  let userId = null;
  try {
    const authorization = request.headers.authorization;
    const token = authorization.split(' ')[1];
    const decodedToken = Jwt.verify(token, process.env.jwt_secret);
    userId = decodedToken.id;
  } catch (e) {
    userId = null;
  }
  return userId;
};
