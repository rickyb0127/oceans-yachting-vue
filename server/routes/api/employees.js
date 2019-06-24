const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Schema = mongoose.Schema;
const multer = require('multer');
let middleware = require('../../middleware');

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
  let bulletPointsArray = req.body.bullets.split(",");
  let photoString = "generic-profile-picture.jpg";
  // let photoString = req.body.first_name.toLowerCase() + '-' + req.body.last_name.toLowerCase() + '.jpg';

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
router.put("/:id", middleware.checkToken, function(req, res) {
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
    if(req.body.photo_string) {
      // let photoString = req.body.first_name.toLowerCase() + '-' + req.body.last_name.toLowerCase() + '.jpg';
      employee.photo_name = req.body.photo_string;
    }

    employee.save(function (error) {
      if (error) {
        console.log(error);
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
        success: true
      });
    }
  });
});

module.exports = router;