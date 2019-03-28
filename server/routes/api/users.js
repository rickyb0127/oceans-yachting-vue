const express = require("express");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const router = express.Router();

const UserSchema = new Schema({
  first_name: String,
  last_name: String,
  bio: String,
  photo: String
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
router.post("/", (req, res) => {
  var new_user = new User({
    first_name: req.body.firstName,
    last_name: req.body.lastName,
    bio: req.body.bio,
    photo: req.body.photo
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
