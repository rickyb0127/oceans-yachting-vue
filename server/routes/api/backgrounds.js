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
    region: 'us-west-2'
  });
} else {
  const config = require('../../config.js');
  aws.config.update({
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: 'us-west-2'
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

const BackgroundSchema = new Schema({
	photo_name: String,
	alt: String,
	isCurrentBackground: Boolean
}, {
  timestamps: true
}, {
  collection: 'backgrounds'
});

const Background = mongoose.model('Background', BackgroundSchema);

//GET
router.get("/", (req, res) => {
	Background.find({}, function (error, backgrounds) {
		if (error) {
			res.send(error);
		} else {
			res.send({
				backgrounds
			});
		}
	});
});

//POST
router.post("/", middleware.checkToken, upload.single('photo'), (req, res) => {
  if(req.file) {
    photoString = req.file.key;
  } else {
		res.status(400).send(error);
	}

	if(req.body.isCurrentBackground) {
		Background.findOne({ isCurrentBackground: true }, function (error, background) {
			if(error) {
				return res.status(500).send('Error on the server.');
			}
			if(background) {
				background.isCurrentBackground = false
	
				background.save(function (error) {
					if (error) {
						res.send(error);
					}
				});
			} 
		});
	}

  var new_background = new Background({
		photo_name: photoString,
		alt: req.body.alt,
		isCurrentBackground: req.body.isCurrentBackground
  });

  new_background.save(function (error) {
    if (error) {
      res.status(400).send(error);
    } else {
      res.send({
        success: true,
        message: "Background saved successfully"
      });
    }
  });
});

//EDIT
router.get("/:id", function (req, res) {
  const id = req.params.id;
  Background.findById(id, function (err, background){
    res.send({
      background
    });
  });
});

//UPDATE
router.put("/:id", middleware.checkToken, upload.single('photo'), function(req, res) {
	if(req.body.isCurrentBackground) {
		Background.findOne({ _id: req.body.currentBackgroundId }, function (error, background) {
			if(error) {
				return res.status(500).send('Error on the server.');
			}
			if(background) {
				background.isCurrentBackground = false
				background.save(function (error) {
					if (error) {
						res.send(error);
					}
				});
			}
		});
	}

	Background.findOne({ _id: req.params.id }, function (error, background) {
    if(error) {
      return res.status(500).send('Error on the server.');
    }
    if(!background) {
      return res.status(404).send('Background not found.');
		}
		
    if(req.file) {
      background.photo_name = req.file.key
		}
		
		if(req.body.alt) {
      background.alt = req.body.alt
		}
		
		if(req.body.isCurrentBackground) {
      background.isCurrentBackground = req.body.isCurrentBackground
    }

    background.save(function (error) {
      if (error) {
        res.send(error);
      } else {
        res.send({
          success: true,
          message: "Background updated successfully"
        });
      }
    });
  });
});

//DELETE
router.delete("/:id", middleware.checkToken, (req, res) => {
  Background.deleteOne({
    _id: req.params.id
  }, function (error, background) {
    if (error) {
      res.send(error)
    } else {
      res.send({
        success: true,
        message: "Background deleted successfully"
      });
    }
  });
});

module.exports = router;