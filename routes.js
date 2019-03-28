'use strict';
const Users = require('./app/controllers/users');

module.exports = [
  { method: 'GET', path: '/api/users', config: Users.find },
  { method: 'GET', path: '/api/users/{id}', config: Users.findOne },
  { method: 'POST', path: '/api/users', config: Users.create },
  { method: 'DELETE', path: '/api/users', config: Users.deleteAll },
  { method: 'DELETE', path: '/api/users/{id}', config: Users.deleteOne },

];