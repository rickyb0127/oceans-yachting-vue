const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Schema = mongoose.Schema;
let middleware = require('../../middleware');

const EngineeringSchema = new Schema({
	text: String
}, {
  timestamps: true
}, {
  collection: 'engineerings'
});

const Engineering = mongoose.model('Engineering', EngineeringSchema);

//GET
router.get("/", (req, res) => {
	Engineering.find({}, function (error, engineerings) {
		if (error) {
			res.send(error);
		} else {
			res.send({
				engineerings
			});
		}
	});
});

//POST
router.post("/", middleware.checkToken, (req, res) => {
  var new_engineering = new Engineering({
		text: req.body.text
  });

  new_engineering.save(function (error) {
    if (error) {
      res.status(400).send(error);
    } else {
      res.send({
        success: true,
        message: "Engineering saved successfully"
      });
    }
  });
});

//UPDATE
router.put("/:id", middleware.checkToken, function(req, res) {
	Engineering.findOne({ _id: req.params.id }, function (error, engineering) {
    if(error) {
      return res.status(500).send('Error on the server.');
    }
    if(!engineering) {
      return res.status(404).send('Engineering not found.');
		}
		
		if(req.body.text) {
      engineering.text = req.body.text;
    }

    engineering.save(function (error) {
      if (error) {
        res.send(error);
      } else {
        res.send({ engineering });
      }
    });
  });
});

module.exports = router;