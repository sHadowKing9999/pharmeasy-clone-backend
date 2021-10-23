const express = require("express");
const bodyParser = require("body-parser");
const cartRouter = express.Router();
const authenticate = require("../authenticate");
var config = require("../config");
const User = require("../models/user");
const { request } = require("express");
cartRouter.use(bodyParser.json());
cartRouter
  .route("/")
  .post(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user._id)
      .then(
        (user) => {
          if (user != null) {
            user.cart.push(req.body);
            user.save().then(
              (user) => {
                User.findById(user._id)

                  .populate("cart.productId")
                  .then((user) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(user.cart);
                  });
              },
              (err) => next(err)
            );
          } else {
            err = new Error(
              "User with Id " + req.user._id + " does not exists"
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    User.findById(req.user._id)
      .then(
        (user) => {
          if (user != null && user.cart.id(req.body.cartId)) {
            user.cart.id(req.body.cartId).quantity = req.body.quantity;
            user
              .save()
              .then(
                (user) => {
                  User.findById(user._id)

                    .populate("cart.productId")
                    .then((user) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(user.cart);
                    });
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else if (user == null) {
            err = new Error("user" + req.user._id + " not found");
            err.status = 404;
            return next(err);
          } else {
            err = new Error("Cart " + req.body.cartId + " not found");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    console.log(req.body);
    User.findById(req.user._id)
      .then(
        (user) => {
          if (user != null && user.cart.id(req.body.cartId)) {
            user.cart.id(req.body.cartId).remove();
            user
              .save()
              .then(
                (user) => {
                  User.findById(user._id)

                    .populate("cart.productId")
                    .then((user) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(user.cart);
                    });
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else if (user == null) {
            err = new Error("User" + req.user._id + " not found");
            err.status = 404;
            return next(err);
          } else {
            err = new Error("Cart " + req.body.cartId + " not found");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });
cartRouter.route("/fetch").post(authenticate.verifyUser, (req, res, next) => {
  console.log(req.body.token);
  authenticate.verifyUser;
  User.findById(req.user._id)

    .populate("cart.productId")
    .then(
      (user) => {
        if (user != null) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(user.cart);
        } else {
          err = new Error("User with Id " + req.user._id + " does not exists");
          err.status = 404;
          return next(err);
        }
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});
module.exports = cartRouter;
