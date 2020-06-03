var createError = require("http-errors");

var express = require("express");
var path = require("path");
var logger = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const mongoStore = require("connect-mongo")(session);
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const passport = require("passport");

require("./config/passport")(passport);

var indexRouter = require("./routes/index");

var app = express();

// view engine setup
const hbs=require('hbs')
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
hbs.registerPartials("./views/partial")

// database connection
mongoose
  .connect(process.env.MONGO_URI || "mongodb://localhost/passport-local", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("connected"))
  .catch((err) => console.log("not connected", err));

// session initialize
app.use(
  session({
    secret: process.env.SESSION_SECRET || "some secret",
    resave: true,
    saveUninitialized: false,
    store: new mongoStore({ mongooseConnection: mongoose.connection }),
    cookie: { maxAge: 1000 * 60 * 60 * 120 },
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// flash
app.use(flash());

//global flash vars
app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.user = req.user || "";
  res.locals.info=req.flash("info");
  next();
});

// passport initialize
app.use(passport.initialize());
app.use(passport.session());

app.use("/", indexRouter);

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

module.exports = app;
