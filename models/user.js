const mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
const Address = new Schema({
  streetaddress: {
    type: String,
    required: true,
  },
  postcode: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  district: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
});
var User = new Schema({
  phonenumber: {
    type: Number,
    default: "",
  },
  firstname: {
    type: String,
    default: "",
  },
  lastname: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  admin: {
    type: Boolean,
    default: false,
  },
  address: Address,
});
User.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", User);
