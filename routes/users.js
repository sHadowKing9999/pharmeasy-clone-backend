var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");
var authenticate = require("../authenticate");
const bodyParser = require("body-parser");
router.use(bodyParser.json());
/* GET users listing. */
router.get(
  "/",
  authenticate.verifyUser,
  authenticate.verifyAdmin,
  (req, res, next) => {
    User.find({}, (err, users) => {
      if (err) {
        return next(err);
      } else {
        res.statusCode = 200;
        res.setHeader("Content_type", "application/json");
        res.json(users);
      }
    });
  }
);
router.post("/signup", function (req, res, next) {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        if (req.body.firstname) user.firstname = req.body.firstname;
        if (req.body.lastname) user.lastname = req.body.lastname;
        user.phonenumber = req.body.username;
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ error: error });
            return;
          } else {
            passport.authenticate("local")(req, res, () => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json({ success: true, status: "Registration successsful!" });
            });
          }
        });
      }
    }
  );
});

router.post("/signin", passport.authenticate("local"), (req, res) => {
  var token = authenticate.getToken({ _id: req.user._id });
  User.findById(req.user._id).then((user) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({
      success: true,
      token: token,
      status: "Login successful!",
      firstname: user.firstname,
    });
  });
});

router.get("/logout", (req, res, next) => {
  if (req.user) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
  } else {
    var err = new Error("You are not logged in");
    err.status = 403;
    next(err);
  }
});
module.exports = router;
