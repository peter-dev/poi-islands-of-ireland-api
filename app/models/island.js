'use strict';
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
// define mongoose island schema
const IslandSchema = Schema(
  {
    name: String,
    description: String,
    location: {
      lat: Number,
      lng: Number
    },
    region: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'Region'
    },
    createdBy: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// define and export 'Island' model compiled from Schema definition
module.exports = Mongoose.model('Island', IslandSchema);
