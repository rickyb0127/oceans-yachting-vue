const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Schema = mongoose.Schema;
let middleware = require('../../middleware');

const PostSchema = new Schema({
    title: String,
    body: {
      type: String,
      required: true
    }
  }, {
    timestamps: true
  }, {
    collection: 'posts'
});

const Post = mongoose.model('Post', PostSchema);

//GET
router.get("/", (req, res) => {
  Post.find({}, function (error, posts) {
    if (error) {
      res.send(error);
    } else {
      res.send({
        posts
      });
    }
  });
});

//GET ADMIN
router.get("/admin", middleware.checkToken, (req, res) => {
  Post.find({}, function (error, posts) {
    if (error) {
      res.send(error);
    } else {
      res.send({
        posts
      });
    }
  });
});

//POST
router.post("/", middleware.checkToken, (req, res) => {
  var new_post = new Post({
    title: req.body.title,
    body: req.body.body
  });

  new_post.save(function (error) {
    if(error) {
    res.status(400).send(error);
    } else {
      res.send({
        success: true,
        message: "Post saved successfully"
      });
    }
  });
});

//EDIT
router.get("/:id", function (req, res) {
  const id = req.params.id;
  Post.findById(id, function (err, post){
    res.send({
      post
    });
  });
});

//UPDATE 
router.put("/:id", middleware.checkToken, function(req, res) {
  Post.findOne({ _id: req.params.id }, function (error, post) {
    if(error) {
      return res.status(500).send('Error on the server.');
    } 
    if(!post) {
      return res.status(404).send('No post found.');
    } 
    if(req.body.title) {
      post.title = req.body.title;
    }
    if(req.body.body) {
      post.body = req.body.body;
    }

    post.save(function (error) {
      if (error) {
        res.send(error);
      } else {
        res.send({
          success: true,
          message: "Post updated successfully"
        });
      }
    });
  });
});

//DELETE
router.delete("/:id", middleware.checkToken, (req, res) => {
  Post.deleteOne({
    _id: req.params.id
  }, function (error, post) {
    if (error) {
      res.send(error);
    } else {
      res.send({
        success: true,
        message: "Post deleted successfully"
      });
    }
  });
});

module.exports = router;