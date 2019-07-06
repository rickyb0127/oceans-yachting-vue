const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Schema = mongoose.Schema;
const multer = require('multer');
let middleware = require('../../middleware');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');

if(process.env.NODE_ENV === "production") {
  aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-west-1'
  });
} else {
  const config = require('../../config.js');
  aws.config.update({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: 'us-west-1'
  });
}

var s3 = new aws.S3();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'oceans-yachting',
        acl: 'public-read',
        key: function (req, file, cb) {
          cb(null, `${Date.now().toString()}-${file.originalname}`);
        }
    })
});

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
      res.send(error);
    } else {
      res.send({
        employees
      });
    }
  });
});

//GET ADMIN
router.get("/admin", middleware.checkToken, (req, res) => {
  Employee.find({}, function (error, employees) {
    if (error) {
      res.send(error);
    } else {
      res.send({
        employees
      });
    }
  });
});

//POST
router.post("/", middleware.checkToken, upload.single('photo'), (req, res) => {
  let bulletPointsArray = req.body.bullets.split(",");
  let photoString = "generic-profile-picture.jpg";
  if(req.file) {
    photoString = req.file.key;
  } else {
    photoString = ""
  }

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
      res.status(400).send(error);
    } else {
      res.send({
        success: true,
        message: "Employee saved successfully"
      });
    }
  });
});

//EDIT
router.get("/:id", function (req, res) {
  const id = req.params.id;
  Employee.findById(id, function (err, employee){
    res.send({
      employee
    });
  });
});

//UPDATE
router.put("/:id", middleware.checkToken, upload.single('photo'), function(req, res) {
  Employee.findOne({ _id: req.params.id }, function (error, employee) {
    if(error) {
      return res.status(500).send('Error on the server.');
    }
    if(!employee) {
      return res.status(404).send('No employee found.');
    }

    if(req.body.first_name) {
      employee.first_name = req.body.first_name;
    }
    if(req.body.last_name) {
      employee.last_name = req.body.last_name;
    }
    if(req.body.title) {
      employee.title = req.body.title;
    }
    if(req.body.bio) {
      employee.bio = req.body.bio;
    }
    if(req.body.quote) {
      employee.quote = req.body.quote;
    }
    if(req.body.bullet_points) {
      let bulletPointsArray = req.body.bullet_points.split(",");
      employee.bullet_points = bulletPointsArray;
    }
    if(req.file) {
      employee.photo_name = req.file.key
    }

    employee.save(function (error) {
      if (error) {
        res.send(error);
      } else {
        res.send({
          success: true,
          message: "Employee updated successfully"
        });
      }
    });
  });
});

//DELETE
router.delete("/:id", middleware.checkToken, (req, res) => {
  Employee.deleteOne({
    _id: req.params.id
  }, function (error, employee) {
    if (error) {
      res.send(error)
    } else {
      res.send({
        success: true,
        message: "Employee deleted successfully"
      });
    }
  });
});

module.exports = router;
