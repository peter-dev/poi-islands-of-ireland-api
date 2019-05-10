'use strict';
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
// define mongoose region schema
const RegionSchema = new Schema(
  {
    name: String,
    identifier: String,
    location: {
      lat: Number,
      lng: Number
    }
  },
  { timestamps: true }
);

// define and export 'Region' model compiled from Schema definition
module.exports = Mongoose.model('Region', RegionSchema);
