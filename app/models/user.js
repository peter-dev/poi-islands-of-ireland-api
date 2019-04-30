'use strict';
const BCrypt = require('bcrypt');
const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;
// define mongoose user schema
const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String
});
// define static methods associated with a Schema
UserSchema.statics.findByEmail = async function(email) {
  return await this.findOne({ email: email });
};
UserSchema.statics.hashPassword = async function(password) {
  const saltRounds = 10;
  return await BCrypt.hash(password, saltRounds);
};
// define instance methods associated with an Object
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await BCrypt.compare(candidatePassword, this.password);
};

// define and export 'User' model compiled from Schema definition
module.exports = Mongoose.model('User', UserSchema);
