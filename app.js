//jshint esversion:6
require('dotenv').config();

const ejs = require("ejs");
const bodyPaser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();
const port = 3000;

const secret = process.env.SECRET;

app.use(bodyPaser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(session({
  secret: "OurliltleSecret",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//Connect to mongodb
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});
mongoose.set("useCreateIndex", true); //Fix Deprecation Warning!

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/////////////////////////////////////////////////////////////////////////////////

app.get("/", function(req, res){
  res.render("home");
});

app.route("/login")
.get(function(req, res){
  res.render("login");
})

.post(function(req, res){

  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
      res.redirect("/login");
    }  else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  });

});

app.get("/secrets", function(req, res){
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/");
  }
});

app.route("/register")
.get(function(req, res){
  res.render("register");
})

.post(function(req, res){

  User.register({username: req.body.username}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      });
    }
  })

});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

/////////////////////////////////////////////////////////////////////////////////

//Start server
app.listen(port, function(err){
  console.log("Server running on port:" + port);
});
