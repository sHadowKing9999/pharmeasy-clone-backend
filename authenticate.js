var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var User = require("./models/user");
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
var jwt = require("jsonwebtoken");
var config = require("./config");
exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
exports.getToken = (user) => {
  return jwt.sign(user, config.secretKey, { expiresIn: 24 * 3600 });
};
var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;
exports.jwtPassport = passport.use(
  new JwtStrategy(opts, (jwt_payload, done) => {
    console.log("Jwt payload : ", jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
      if (err) {
        return done(err, false);
      } else if (user) {
        //console.log(user);
        return done(null, user);
      } else {
        return done(null, false);
      }
    });
  })
);
exports.verifyUser = function (req, res, next) {
  var token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (token) {
    jwt.verify(token, config.secretKey, function (err, user) {
      if (err) {
        var err = new Error("You need to sign in again as session expired!");
        err.status = 401;
        return next(err);
      } else {
        req.user = user;
        next();
      }
    });
  } else {
    var err = new Error("You need to sign in!");
    err.status = 403;
    return next(err);
  }
};

exports.verifyAdmin = function (req, res, next) {
  console.log(req.user);
  User.findOne({ _id: req.user._id })
    .then(
      (user) => {
        if (user.admin) {
          next();
        } else {
          var err = new Error(
            "You are not authorized to perform this operation!"
          );
          err.status = 403;
          return next(err);
        }
      },
      (err) => next(err)
    )
    .catch((err) => next(err));
};
