const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  id: {
    type: Number,
    autoIncrement: true,
    primaryKey: true,
  },

  firstName: {
    type: String,
    allowNull: false,
  },

  lastName: {
    type: String,
    allowNull: false,
  },

  email: {
    type: String,
    allowNull: false,
  },

  password: {
    type: String,
  },

  Mobilenumber: {
    type: Number,
    allowNull: false,
  }, 
  resetPasswordToken: {
    type: String,
    default: undefined,
  },
  resetPasswordExpires: {
    type: Date,
    default: undefined,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
