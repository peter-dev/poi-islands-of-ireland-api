'use strict';
// import .env
require('dotenv').config();
const Mongoose = require('mongoose');

async function seed() {
  let seeder = require('mais-mongoose-seeder')(Mongoose);
  const data = require('./initdata.json');
  const User = require('./user');
  const Region = require('./region');
  const Island = require('./island');
  const Rating = require('./rating');
  const dbData = await seeder.seed(data, { dropDatabase: false, dropCollections: true });
  console.log(dbData);
}

// connect to the database service
exports.connectToDb = async function(shouldSeed) {
  Mongoose.connect(process.env.db, { useNewUrlParser: true });
  const db = Mongoose.connection;
  // log fail
  db.on('error', function(err) {
    console.log(`database connection error: ${err}`);
  });
  // log disconnect
  db.on('disconnected', function() {
    console.log('database disconnected');
  });
  // log success
  db.once('open', function() {
    console.log(`database connected to ${this.name} on ${this.host}`);
    if (shouldSeed) {
      seed();
    }
  });
};
