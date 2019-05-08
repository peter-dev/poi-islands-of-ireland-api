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
const Hapi = require('hapi');
const Inert = require('inert');
const Vision = require('vision');
const HapiSwagger = require('hapi-swagger');
const HapiAuthJwt2 = require('hapi-auth-jwt2')
const Pack = require('./package');
const Routes = require('./routes');
const Utils = require('./app/controllers/utils');

// create a server with a host and port
const server = Hapi.server({
  host: 'localhost',
  port: 3000
});
// import database connection
require('./app/models/db');
const swaggerOptions = {
  info: {
    title: 'POI Islands of Ireland API Documentation',
    version: Pack.version
  },
  grouping: 'tags',
  securityDefinitions: {
    jwt: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header'
    }
  }
};

// start the server
const init = async function() {
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
    verifyOptions: { algorithms: ['HS256'] },
  });

  server.auth.default({
    mode: 'required',
    strategy: 'jwt'
  });

  server.route(Routes);
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
