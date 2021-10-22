const express = require("express");
const bodyParser = require("body-parser");
const productRouter = express.Router();
const authenticate = require("../authenticate");
var config = require("../config");
const Products = require("../models/products");
productRouter.use(bodyParser.json());
productRouter
  .route("/")
  .get((req, res, next) => {
    Products.find({})

      .populate("comments.author", "firstname lastname")
      .then(
        (products) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(products);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Products.create(req.body)
      .then(
        (product) => {
          console.log("product created ", product);
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(product);
        },
        (err) => next(err)
      )
      .catch((err) => {
        console.log("not knowing");
        next(err);
      });
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end("Put operation not suppoorted on /products");
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Products.remove({})
        .then(
          (resp) => {
            console.log("products removed");
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );
productRouter.route("/medicines").get((req, res, next) => {
  Products.find({ category: config.category.medicine })

    .populate("comments.author", "firstname lastname")
    .then(
      (products) => {
        if (products != null) {
          res.status = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(products);
        } else {
          err = new Error(
            "Product of category Medicines have not been listed yet"
          );
          err.status = 404;
          next(err);
        }
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
});
productRouter
  .route("/:productId")
  .get((req, res, next) => {
    Products.findById(req.params.productId)

      .populate("comments.author", "firstname lastname")
      .then(
        (product) => {
          if (product != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(product);
          } else {
            err = new Error(
              "product with Id " + req.params.productId + " not found"
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    res.statusCode = 403;
    res.end("Post operation not valid on /products/" + req.params.productId);
  })
  .put(authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Products.findByIdAndUpdate(
      req.params.productId,
      { $set: req.body },
      { new: true }
    )
      .then(
        (product) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(product);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Products.findByIdAndDelete(req.params.productId)
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(resp);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );
productRouter
  .route("/:productId/comments")
  .get((req, res, next) => {
    Products.findById(req.params.productId)

      .populate("comments.author", "firstname lastname")
      .then(
        (product) => {
          if (product != null) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(product.comments);
          } else {
            err = new Error(
              "product with Id " + req.params.productId + " does not exists"
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    Products.findById(req.params.productId)
      .then(
        (product) => {
          if (product != null) {
            req.body.author = req.user._id;
            product.comments.push(req.body);
            product.save().then(
              (product) => {
                Products.findById(product._id)

                  .populate("comments.author", "firstname lastname")
                  .then((product) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(product);
                  });
              },
              (err) => next(err)
            );
          } else {
            err = new Error(
              "product with Id " + req.params.productId + " does not exists"
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
    res.statusCode = 403;
    res.end(
      "Put operation not supported on /productes/" +
        req.params.productId +
        "/comments"
    );
  })
  .delete(
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Products.findById(req.params.productId)
        .then(
          (product) => {
            if (product != null) {
              for (var i = product.comments.length - 1; i >= 0; i--) {
                product.comments.id(product.comments[i]._id).remove();
              }
              product.save().then(
                (product) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(product);
                },
                (err) => next(err)
              );
            } else {
              err = new Error(
                "product with Id " + req.params.productId + " does not exists"
              );
              err.status = 404;
              return next(err);
            }
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );
productRouter
  .route("/:productId/comments/:commentId")
  .get((req, res, next) => {
    Products.findById(req.params.productId)
      .populate("comments.author", "firstname lastname")
      .then(
        (product) => {
          console.log(product.comments.id(req.params.commentId));
          if (
            product != null &&
            product.comments.id(req.params.commentId) != null
          ) {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(product.comments.id(req.params.commentId));
          } else if (product != null) {
            err = new Error(
              "product with Id " + req.params.productId + " does not exists"
            );
            err.status = 404;
            return next(err);
          } else {
            err = new Error(
              "product with Id " +
                req.params.productId +
                " does not have comment with Id: " +
                req.params.commentId
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      "Post operation not supported on /productes/" +
        req.params.productId +
        "/comments/" +
        req.params.commentId
    );
  })
  .put(authenticate.verifyUser, (req, res, next) => {
    Products.findById(req.params.productId)
      .then(
        (product) => {
          if (product != null && product.comments.id(req.params.commentId)) {
            if (
              product.comments.id(req.params.commentId).author.toString() !=
              req.user._id.toString()
            ) {
              err = new Error("You are not authorized to edit this comment");
              err.status = 403;
              return next(err);
            }
            if (req.body.rating) {
              product.comments.id(req.params.commentId).rating =
                req.body.rating;
            }

            if (req.body.comment) {
              product.comments.id(req.params.commentId).comment =
                req.body.comment;
            }
            product
              .save()
              .then(
                (product) => {
                  Products.findById(product._id)

                    .populate("comments.author", "firstname lastname")
                    .then((product) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(product);
                    });
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else if (product == null) {
            err = new Error("product " + req.params.productId + " not found");
            err.status = 404;
            return next(err);
          } else {
            err = new Error("Comment " + req.params.commentId + " not found");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .delete(authenticate.verifyUser, (req, res, next) => {
    Products.findById(req.params.productId)
      .then(
        (product) => {
          if (product != null && product.comments.id(req.params.commentId)) {
            if (
              product.comments.id(req.params.commentId).author.toString() !=
              req.user._id.toString()
            ) {
              err = new Error("You are not authorized to edit this comment");
              err.status = 403;
              return next(err);
            }
            product.comments.id(req.params.commentId).remove();
            product
              .save()
              .then(
                (product) => {
                  Products.findById(product._id)

                    .populate("comments.author", "firstname lastname")
                    .then((product) => {
                      res.statusCode = 200;
                      res.setHeader("Content-Type", "application/json");
                      res.json(product);
                    });
                },
                (err) => next(err)
              )
              .catch((err) => next(err));
          } else if (product == null) {
            err = new Error("product " + req.params.productId + " not found");
            err.status = 404;
            return next(err);
          } else {
            err = new Error("Comment " + req.params.commentId + " not found");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = productRouter;
