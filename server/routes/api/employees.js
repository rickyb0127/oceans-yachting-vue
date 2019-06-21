const express = require("express");
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

const EmployeeSchema = new Schema({
  first_name: String,
  last_name: String,
  title: String,
  bio: String,
  quote: String,
  bullet_points: [String],
  photo_name: String
}, {
  timestamps: true
}, {
  collection: 'employees'
});

const Employee = mongoose.model('Employee', EmployeeSchema);

//GET
router.get("/", (req, res) => {
  Employee.find({}, function (error, employees) {
    if (error) {
      console.error(error);
    } else {
      res.send({
        employees
      });
    }
  });
});

//POST
router.post("/", upload.single('photo'), (req, res) => {
  // const re = /,\s/;
  let bulletPointsArray = req.body.bullets.split(",");
  let photoString = req.body.first_name.toLowerCase() + '-' + req.body.last_name.toLowerCase() + '.jpg';
  console.log(bulletPointsArray);

  var new_employee = new Employee({
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    title: req.body.title,
    bio: req.body.bio,
    quote: req.body.quote,
    bullet_points: bulletPointsArray,
    photo_name: photoString
  });

  new_employee.save(function (error) {
    if (error) {
      console.log(error);
    } else {
      res.send({
        success: true,
        message: "Employee saved successfully"
      });
    }
  });
});

//DELETE
router.delete("/:id", (req, res) => {
  User.deleteOne({
    _id: req.params.id
  }, function (error, employee) {
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