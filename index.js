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
const Pack = require('./package');
const Routes = require('./routes');

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
  grouping: 'tags'
};

// start the server
const init = async function() {
  await server.register([
    Inert,
    Vision,
    {
      plugin: HapiSwagger,
      options: swaggerOptions
    }
  ]);

  server.route(Routes);
  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
