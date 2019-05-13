const express = require("express");
const fs = require('fs');
const mongoose = require("mongoose");
const router = express.Router();
const Schema = mongoose.Schema;
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './img/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({storage: storage});

const UserSchema = new Schema({
  first_name: String,
  last_name: String,
  title: String,
  bio: String,
  quote: String,
  bullet_points: [String],
  photo_name: String
});

const User = mongoose.model('User', UserSchema);

const dbRoute = "mongodb://admin:Wookie2000@ds155411.mlab.com:55411/oceans-yachting";

// connects our back end code with the database
mongoose.connect(
  dbRoute,
  { useNewUrlParser: true }
);

let db = mongoose.connection;

db.once("open", () => console.log("connected to the database"));

// checks if connection with the database is successful
db.on("error", console.error.bind(console, "MongoDB connection error:"));

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

//POST
router.post("/", upload.single('photo'), (req, res) => {
  const re = /,\s/;
  let bulletPointsArray = req.body.bullets.split(re);
  let photoString = req.body.first_name.toLowerCase() + '-' + req.body.last_name.toLowerCase() + '.jpg';

  var new_user = new User({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    title: req.body.title,
    bio: req.body.bio,
    quote: req.body.quote,
    bullet_points: bulletPointsArray,
    photo_name: photoString
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
