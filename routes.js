'use strict';
const Users = require('./app/controllers/users');

module.exports = [
  { method: 'POST', path: '/api/users', config: Users.create },
  { method: 'GET', path: '/api/users', config: Users.findAll },
  { method: 'GET', path: '/api/users/{id}', config: Users.findOne },
  { method: 'PUT', path: '/api/users/{id}', config: Users.update },
  { method: 'DELETE', path: '/api/users', config: Users.deleteAll },
  { method: 'DELETE', path: '/api/users/{id}', config: Users.deleteOne },

];