const mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;
const cartItemSchema = new Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
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
  cart: [cartItemSchema],
});
User.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", User);
