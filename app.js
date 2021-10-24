var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var config = require("./config");
var passport = require("passport");
var authenticate = require("./authenticate");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var productRouter = require("./routes/productRouter");
const cartRouter = require("./routes/cartRouter");
var app = express();
const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const url = config.mongoUrl;
const cors = require("cors");
app.use(
  cors({
    origin: ["http://localhost:3000", "223.187.157.203/32"],
  })
);
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }).then(
  (resp) => {
    console.log("Connected succesfully to the Mongoose Server");
    app.set("views", path.join(__dirname, "views"));
    app.set("view engine", "jade");

    app.use(logger("dev"));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));

    app.use(passport.initialize());

    app.use("/", indexRouter);
    app.use("/users", usersRouter);
    app.use("/cart", cartRouter);
    app.use(express.static(path.join(__dirname, "public")));

    app.use("/products", productRouter);
    // catch 404 and forward to error handler
    app.use(function (req, res, next) {
      next(createError(404));
    });

    // error handler
    app.use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message;
      res.locals.error = req.app.get("env") === "development" ? err : {};

      // render the error page
      res.status(err.status || 500);
      res.render("error");
    });
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
      console.log("Server started at port ", port);
    });
  },
  (err) => console.log(err)
);
// view engine setup
module.exports = app;
