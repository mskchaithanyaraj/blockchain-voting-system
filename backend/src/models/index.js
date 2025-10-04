/**
 * Models Index
 * Central export point for all database models
 */

const User = require("./User.model");
const Vote = require("./Vote.model");

module.exports = {
  User,
  Vote,
};
