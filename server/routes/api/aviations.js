const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Schema = mongoose.Schema;
let middleware = require('../../middleware');

const AviationSchema = new Schema({
	text: String
}, {
  timestamps: true
}, {
  collection: 'aviations'
});

const Aviation = mongoose.model('Aviation', AviationSchema);

//GET
router.get("/", (req, res) => {
	Aviation.find({}, function (error, aviations) {
		if (error) {
			res.send(error);
		} else {
			res.send({
				aviations
			});
		}
	});
});

//POST
router.post("/", middleware.checkToken, (req, res) => {
  var new_aviation = new Aviation({
		text: req.body.text
  });

  new_aviation.save(function (error) {
    if (error) {
      res.status(400).send(error);
    } else {
      res.send({
        success: true,
        message: "Aviation saved successfully"
      });
    }
  });
});

//UPDATE
router.put("/:id", middleware.checkToken, function(req, res) {
	Aviation.findOne({ _id: req.params.id }, function (error, aviation) {
    if(error) {
      return res.status(500).send('Error on the server.');
    }
    if(!aviation) {
      return res.status(404).send('Aviation not found.');
		}
		
		if(req.body.text) {
      aviation.text = req.body.text;
    }

    aviation.save(function (error) {
      if (error) {
        res.send(error);
      } else {
        res.send({ aviation });
      }
    });
  });
});

module.exports = router;