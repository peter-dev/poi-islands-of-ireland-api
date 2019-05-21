'use strict';
// import .env
const dotenv = require('dotenv');
// read .env file, parse the contents, assign it to process.env object
const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  process.exit(1);
}
// import required modules
const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Vision = require('@hapi/vision');
const HapiSwagger = require('hapi-swagger');
const HapiAuthJwt2 = require('hapi-auth-jwt2');
const Pack = require('./package');
const Routes = require('./routes');
const Utils = require('./app/controllers/utils');

// create a server with a host and port and global validation handling
const server = Hapi.server({
  host: 'localhost',
  port: 3000,
  routes: {
    cors: true,
    validate: {
      options: {
        abortEarly: false
      },
      failAction: async function(request, h, err) {
        //console.error('Validation Error:', err.message);
        throw err;
      }
    }
  }
});

// import database connection
const { connectToDb } = require('./app/models/db');

// configure swagger documentation
const swaggerOptions = {
  info: {
    title: 'POI Islands of Ireland API Documentation',
    version: Pack.version
  },
  tags: [{ name: 'users' }, { name: 'regions' }, { name: 'islands' }, { name: 'ratings' }, { name: 'admin' }],
  grouping: 'tags',
  sortEndpoints: 'method',
  securityDefinitions: {
    jwt: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header'
    }
  }
};

// configure the server
const configure = async function() {
  await server.register([
    Inert,
    Vision,
    HapiAuthJwt2,
    {
      plugin: HapiSwagger,
      options: swaggerOptions
    }
  ]);

  server.auth.strategy('jwt', 'jwt', {
    key: process.env.jwt_secret,
    validate: Utils.validate,
    verifyOptions: { algorithms: ['HS256'] }
  });

  server.auth.default({
    mode: 'required',
    strategy: 'jwt'
  });

  server.route(Routes);
};

// initialize the server
exports.init = async function() {
  await connectToDb(false);
  await configure();
  await server.initialize();
  return server;
};

// start the server
exports.start = async function() {
  await connectToDb(true);
  await configure();
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
  return server;
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});
