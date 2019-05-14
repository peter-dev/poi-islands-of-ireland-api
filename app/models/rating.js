'use strict';
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
// define mongoose rating schema
const RatingSchema = Schema(
  {
    score: Number,
    island: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'Island'
    },
    user: {
      type: Mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

// define and export 'Rating' model compiled from Schema definition
module.exports = Mongoose.model('Rating', RatingSchema);
