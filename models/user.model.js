const mongoose = require('../database');
const bcrypt = require("bcryptjs");
const authConfig = require("../config/auth.config");
const UserShema = new mongoose.Schema({
  firstName: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
    require: true,
  },
  userName: {
    type: String,
    unique: true,
    require: true,
  },
  email: {
    type: String,
    unique: true,
    require: true,
    lowercase: true,
  },
  password: {
    type: String,
    require: true,
    select: false,
  },
  permissionLevel: {
    type: Number,
    require: true,
    default: 0,
  },
  admin: {
    type: Boolean,
    require: true,
    default: false,
  },
  active: {
    type: Boolean,
    require: true,
    default: false,
  },
  verified: {
    type: Boolean,
    require: true,
    default: false,
  },
  expiry: {
    type: Date,
    default: null,
  },
  lastLoginInstant: {
    type: Date,
    default: Date.now,
  },
  passwordChangeRequired: {
    type: Boolean,
    require: true,
    default: false,
  },
  passwordLastUpdateInstant: {
    type: Date,
    default: Date.now,
  },
  token: {
    type: String,
    select: false,
    default: null,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});

UserShema.pre("save", async function(next) {
  const hash = await bcrypt.hash(this.password, authConfig.saltRounds);
  this.password = hash;
  next();
});

const User = mongoose.model('User', UserShema);

module.exports = User;