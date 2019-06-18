//jshint esversion:6
require('dotenv').config();

const ejs = require("ejs");
const bodyPaser = require("body-parser");
const mongoose = require("mongoose");
const express = require("express");
const md5 = require('md5');

const app = express();
const port = 3000;

const secret = process.env.SECRET;

app.use(bodyPaser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
//Connect to mongodb
mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});



const User = new mongoose.model("User", userSchema);

/////////////////////////////////////////////////////////////////////////////////

app.get("/", function(req, res){
  res.render("home");
});

app.route("/login")
.get(function(req, res){
  res.render("login");
})

.post(function(req, res){
  const username = req.body.username;
  const password = md5(req.body.password);

  User.findOne({email: username}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (md5(foundUser.password) === password) {
          res.render("secrets");
        } else {
          res.redirect("/login");
        }
      }
    }
  });

});


app.route("/register")
.get(function(req, res){
  res.render("register");
})

.post(function(req, res){
  const newUser = new User({
    email: req.body.username,
    password: md5(req.body.password)
  });
  newUser.save(function(err){
    if (!err) {
      console.log("New user created");
      res.render("secrets");
    } else {
      console.log(err);
    }
  });
});



/////////////////////////////////////////////////////////////////////////////////

//Start server
app.listen(port, function(err){
  console.log("Server running on port:" + port);
});
