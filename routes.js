'use strict';
const Users = require('./app/controllers/users');
const Regions = require('./app/controllers/regions');
const Islands = require('./app/controllers/islands');
const Ratings = require('./app/controllers/ratings');

module.exports = [
  { method: 'POST', path: '/api/users/authenticate', config: Users.authenticate },
  { method: 'POST', path: '/api/users', config: Users.create },
  { method: 'GET', path: '/api/users', config: Users.findAll },
  { method: 'GET', path: '/api/users/{id}', config: Users.findOne },
  { method: 'PUT', path: '/api/users/{id}', config: Users.update },
  { method: 'DELETE', path: '/api/users', config: Users.deleteAll },
  { method: 'DELETE', path: '/api/users/{id}', config: Users.deleteOne },

  { method: 'GET', path: '/api/regions', config: Regions.findAll },
  { method: 'GET', path: '/api/regions/{id}', config: Regions.findOne },

  { method: 'POST', path: '/api/regions/{id}/islands', config: Islands.create },
  { method: 'GET', path: '/api/islands', config: Islands.findAll },
  { method: 'GET', path: '/api/islands/{id}', config: Islands.findOne },
  { method: 'GET', path: '/api/regions/{id}/islands', config: Islands.findByRegion },
  { method: 'PUT', path: '/api/regions/{region_id}/islands/{island_id}', config: Islands.update },
  { method: 'DELETE', path: '/api/islands', config: Islands.deleteAll },
  { method: 'DELETE', path: '/api/regions/{id}/islands', config: Islands.deleteByRegion },

  { method: 'POST', path: '/api/ratings', config: Ratings.create },
  { method: 'GET', path: '/api/ratings/{id}', config: Ratings.findOne },
  { method: 'GET', path: '/api/islands/{id}/ratings', config: Ratings.findByIsland },
  { method: 'GET', path: '/api/users/{id}/ratings', config: Ratings.findByUser },
  { method: 'PUT', path: '/api/ratings/{id}', config: Ratings.update },
  { method: 'DELETE', path: '/api/ratings', config: Ratings.deleteAll },
  { method: 'DELETE', path: '/api/ratings/{id}', config: Ratings.deleteOne },
  { method: 'DELETE', path: '/api/islands/{id}/ratings', config: Ratings.deleteByIsland },
  { method: 'DELETE', path: '/api/users/{id}/ratings', config: Ratings.deleteByUser }
];
