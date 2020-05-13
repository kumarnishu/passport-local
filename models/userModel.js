const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  added_on: {
    type: Date,
    default: Date.now(),
  },
  last_login: {
    type: Date,
    default: null,
  },
});
module.exports = mongoose.model("User", userSchema);
