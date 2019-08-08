const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Schema = mongoose.Schema;
let middleware = require('../../middleware');

const YachtManagementSchema = new Schema({
	text: String
}, {
  timestamps: true
}, {
  collection: 'yachtmanagements'
});

const YachtManagement = mongoose.model('YachtManagement', YachtManagementSchema);

//GET
router.get("/", (req, res) => {
	YachtManagement.find({}, function (error, yachtmanagements) {
		if (error) {
			res.send(error);
		} else {
			res.send({
				yachtmanagements
			});
		}
	});
});

//POST
router.post("/", middleware.checkToken, (req, res) => {
  var new_yacht_management = new YachtManagement({
		text: req.body.text
  });

  new_yacht_management.save(function (error) {
    if (error) {
      res.status(400).send(error);
    } else {
      res.send({
        success: true,
        message: "Yacht management saved successfully"
      });
    }
  });
});

//UPDATE
router.put("/:id", middleware.checkToken, function(req, res) {
  console.log(req.body.text);
	YachtManagement.findOne({ _id: req.params.id }, function (error, yachtmanagement) {
    if(error) {
      return res.status(500).send('Error on the server.');
    }
    if(!yachtmanagement) {
      return res.status(404).send('Yacht management not found.');
		}
		
		if(req.body.text) {
      yachtmanagement.text = req.body.text;
    }

    yachtmanagement.save(function (error) {
      if (error) {
        res.send(error);
      } else {
        res.send({ yachtmanagement });
      }
    });
  });
});

module.exports = router;