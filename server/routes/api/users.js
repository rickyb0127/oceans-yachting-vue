const express = require("express");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const router = express.Router();
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: String,
  last_name: String,
  email: String,
  password: String,
  isAdmin: Boolean
}, {
  timestamps: true
}, {
  collection: 'users'
});

const User = mongoose.model('User', UserSchema);

//GET
router.get("/", (req, res) => {
  User.find({}, function (error, users) {
    if (error) {
      console.error(error);
    } else {
      res.send({
        users
      });
    }
  });
});

// Register
router.post("/register", (req, res) => {
  var hash = bcrypt.hashSync(req.body.password, 8);
  var new_user = new User({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: hash,
    isAdmin: true
  });

  new_user.save(function (error) {
    if (error) {
      console.log(error);
    } else {
      res.send({
        success: true,
        message: "User saved successfully"
      });
    }
  });
});

// Login
router.post("/login", (req, res) => {
  User.findOne({ email: req.body.email }, function (error, user) {
    if(error) {
      return res.status(500).send('Error on the server.');
    } 
    if(!user) {
      return res.status(404).send('No user found.');
    } 

    let passwordIsValid = bcrypt.compareSync(req.body.password, user.password);
    if(!passwordIsValid) {
      return res.status(401).send({ auth: false, token: null });
    } else {
      var secret;
      if(process.env.NODE_ENV === "production") {
        secret = process.env.JWT_SECRET;
      } else {
        const config = require('../../config');
        secret = config.secret;
      }

      let token = jwt.sign({
        username: user.email
      },secret,
      { 
        expiresIn: '24h' // expires in 24 hours
      });
      res.status(200).send({ auth: true, token: token, user: user });
    }
  })
});

//DELETE
router.delete("/:id", (req, res) => {
  User.deleteOne({
    _id: req.params.id
  }, function (error, user) {
    if (error) {
      res.send(error)
    } else {
      res.send({
        success: true
      });
    }
  });
});

module.exports = router;
